import { modal, toast } from "@common";
import { Logger } from "@replugged";
import type { AnyAddonManifest, CheckResultSuccess } from "src/types";
import * as pluginManager from "../../managers/plugins";
import * as themeManager from "../../managers/themes";

const logger = Logger.coremod("Installer");

// First item is the default
const INSTALLER_SOURCES = ["store", "github"] as const;
export type InstallerSource = typeof INSTALLER_SOURCES[number];

const CACHE_INTERVAL = 1000 * 60 * 60;

const cache: Map<string, { data: CheckResultSuccess; expires: Date }> = new Map();

export function isValidSource(type: string): type is InstallerSource {
  // @ts-expect-error Doesn't matter that it might not be a valid type
  return INSTALLER_SOURCES.includes(type);
}

export async function getInfo(
  identifier: string,
  source?: InstallerSource,
  id?: string,
): Promise<CheckResultSuccess | null> {
  source ??= INSTALLER_SOURCES[0];
  // TODO: remove this once store is supported
  // Need to make sure GitHub install links will have the type specified
  // so they won't break once store is available (since that will be the default)
  if (source === "store") {
    logger.error('Store installers are not supported yet. Please specify "github" as the type.');
    return null;
  }

  const cacheIdentifier = `${source}:${identifier}:${id ?? ""}`;
  const cached = cache.get(cacheIdentifier);
  if (cached && cached.expires > new Date()) {
    return cached.data;
  }

  const info = await RepluggedNative.installer.getInfo(source, identifier, id);
  if (!info.success) {
    logger.error(`Failed to get info for ${identifier}: ${info.error}`);
    return null;
  }

  cache.set(cacheIdentifier, {
    data: info,
    expires: new Date(Date.now() + CACHE_INTERVAL),
  });

  return info;
}

export function checkIsInstalled(data: CheckResultSuccess): boolean {
  switch (data.manifest.type) {
    case "replugged-plugin":
      return pluginManager.plugins.has(data.manifest.id);
    case "replugged-theme":
      return themeManager.themes.has(data.manifest.id);
  }
}

export async function loadNew(data: CheckResultSuccess): Promise<boolean> {
  try {
    switch (data.manifest.type) {
      case "replugged-plugin":
        await pluginManager.loadAll();
        await pluginManager.start(data.manifest.id);
        await pluginManager.enable(data.manifest.id);
        return true;
      case "replugged-theme":
        await themeManager.loadMissing();
        themeManager.load(data.manifest.id);
        themeManager.enable(data.manifest.id);
        return true;
    }
  } catch (err) {
    logger.error(`Failed to load ${data.manifest.name}`, err);
    return false;
  }
}

export async function install(data: CheckResultSuccess): Promise<boolean> {
  const {
    url,
    manifest: { name, type, id },
  } = data;

  const res = await RepluggedNative.installer.install(type, `${id}.asar`, url);
  if (!res.success) {
    logger.error(`Failed to install ${name}: ${res.error}`);
    toast.toast(`Failed to install ${name}.`, toast.Kind.FAILURE);
    return false;
  }

  const loaded = await loadNew(data);

  if (!loaded) {
    toast.toast(`${name} was installed but could not be loaded.`, toast.Kind.FAILURE);
    return false;
  }

  toast.toast(`${name} installed successfully.`, toast.Kind.SUCCESS);
  return true;
}

function authorList(authors: string[]): string {
  if (authors.length === 1) {
    return authors[0];
  }
  if (authors.length === 2) {
    return `${authors[0]} and ${authors[1]}`;
  }
  return `${authors.slice(0, -1).join(", ")}, and ${authors[authors.length - 1]}`;
}

async function showInstallPrompt(manifest: AnyAddonManifest): Promise<boolean> {
  let type: string;
  switch (manifest.type) {
    case "replugged-plugin":
      type = "plugin";
      break;
    case "replugged-theme":
      type = "theme";
      break;
  }
  const authors = authorList([manifest.author].flat().map((a) => a.name));

  const title = `Install ${type}`;
  const body = `Do you want to install ${manifest.name} by ${authors}?`;

  const res = await modal.confirm({
    title,
    body,
    confirmText: "Install",
    cancelText: "Cancel",
  });

  return res || false;
}

export type InstallResponse =
  | {
      kind: "SUCCESS";
      manifest: AnyAddonManifest;
    }
  | {
      kind: "FAILED";
      manifest?: AnyAddonManifest;
    }
  | {
      kind: "ALREADY_INSTALLED";
      manifest: AnyAddonManifest;
    }
  | {
      kind: "CANCELLED";
      manifest: AnyAddonManifest;
    };

/**
 *
 * @param identifier Identifier for the addon in that source
 * @param source Updater source type
 * @param id Optional ID for the addon in that source. Useful for GitHub repositories that have multiple addons.
 * @returns
 */
export async function installFlow(
  identifier: string,
  source?: InstallerSource,
  id?: string,
  showToasts = true,
): Promise<InstallResponse> {
  const info = await getInfo(identifier, source, id);
  if (!info) {
    if (showToasts) toast.toast(`Failed to get info for addon.`, toast.Kind.FAILURE);
    return {
      kind: "FAILED",
    };
  }

  if (checkIsInstalled(info)) {
    if (showToasts) toast.toast(`${info.manifest.name} is already installed.`, toast.Kind.MESSAGE);
    return {
      kind: "ALREADY_INSTALLED",
      manifest: info.manifest,
    };
  }

  window.DiscordNative.window.focus();

  const confirm = await showInstallPrompt(info.manifest);
  if (!confirm) {
    toast.toast("Installation cancelled.", toast.Kind.MESSAGE);
    return {
      kind: "CANCELLED",
      manifest: info.manifest,
    };
  }

  await install(info);

  return {
    kind: "SUCCESS",
    manifest: info.manifest,
  };
}
