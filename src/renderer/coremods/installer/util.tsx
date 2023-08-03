import { modal, toast } from "@common";
import { Messages } from "@common/i18n";
import { Button, Notice } from "@components";
import { Logger } from "@replugged";
import { setUpdaterState } from "src/renderer/managers/updater";
import { openExternal } from "src/renderer/util";
import type { AnyAddonManifest, CheckResultSuccess } from "src/types";
import * as pluginManager from "../../managers/plugins";
import * as themeManager from "../../managers/themes";
import { getAddonType, getSourceLink, label } from "../settings/pages";

const logger = Logger.coremod("Installer");

// First item is the default
const INSTALLER_SOURCES = ["store", "github"] as const;
export type InstallerSource = (typeof INSTALLER_SOURCES)[number];

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
  if (info.manifest.type === "replugged") {
    logger.error("Cannot install Replugged itself");
    return null;
  }

  cache.set(cacheIdentifier, {
    data: info,
    expires: new Date(Date.now() + CACHE_INTERVAL),
  });

  return info;
}

export function checkIsInstalled(data: CheckResultSuccess): boolean {
  if (data.manifest.type === "replugged") {
    throw new Error("Cannot check Replugged itself");
  }

  switch (data.manifest.type) {
    case "replugged-plugin":
      return pluginManager.plugins.has(data.manifest.id);
    case "replugged-theme":
      return themeManager.themes.has(data.manifest.id);
  }
}

export async function loadNew(data: CheckResultSuccess): Promise<boolean> {
  if (data.manifest.type === "replugged") {
    throw new Error("Cannot load Replugged itself");
  }

  try {
    switch (data.manifest.type) {
      case "replugged-plugin":
        await pluginManager.loadAll();
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
  if (data.manifest.type === "replugged") {
    throw new Error("Cannot install Replugged itself");
  }

  const {
    url,
    webUrl,
    manifest: { name, type, id, version },
  } = data;

  const res = await RepluggedNative.installer.install(type, `${id}.asar`, url);
  if (!res.success) {
    logger.error(`Failed to install ${name}: ${res.error}`);
    toast.toast(
      Messages.REPLUGGED_TOAST_INSTALLER_ADDON_INSTALL_FAILED.format({ name }),
      toast.Kind.FAILURE,
    );
    return false;
  }

  setUpdaterState(id, {
    available: false,
    lastChecked: Date.now(),
    url,
    webUrl,
    version,
  });

  const loaded = await loadNew(data);

  if (!loaded) {
    toast.toast(
      Messages.REPLUGGED_TOAST_INSTALLER_ADDON_LOAD_FAILED.format({ name }),
      toast.Kind.FAILURE,
    );
    return false;
  }

  toast.toast(
    Messages.REPLUGGED_TOAST_INSTALLER_ADDON_INSTALL_SUCCESS.format({ name }),
    toast.Kind.SUCCESS,
  );
  return true;
}

export function authorList(authors: string[]): string {
  if (authors.length === 1) {
    return Messages.REPLUGGED_ADDON_AUTHORS_ONE.format({
      author1: authors[0],
    });
  }
  if (authors.length === 2) {
    return Messages.REPLUGGED_ADDON_AUTHORS_TWO.format({
      author1: authors[0],
      author2: authors[1],
    });
  }
  if (authors.length === 3) {
    return Messages.REPLUGGED_ADDON_AUTHORS_THREE.format({
      author1: authors[0],
      author2: authors[1],
      author3: authors[2],
    });
  }

  return Messages.REPLUGGED_ADDON_AUTHORS_MANY.format({
    author1: authors[0],
    author2: authors[1],
    author3: authors[2],
    count: authors.length - 3,
  });
}

async function showInstallPrompt(
  manifest: AnyAddonManifest,
  linkToStore = true,
): Promise<boolean | null> {
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

  const title = Messages.REPLUGGED_INSTALL_MODAL_HEADER.format({ type });
  const text = Messages.REPLUGGED_INSTALLER_INSTALL_PROMPT_BODY.format({
    name: manifest.name,
    authors,
  });

  const storeUrl = linkToStore ? getSourceLink(manifest) : undefined;

  const res = await modal.confirm({
    title,
    body: (
      <>
        {text}
        {manifest.updater?.type !== "store" ? (
          <div style={{ marginTop: "16px" }}>
            <Notice messageType={Notice.Types.ERROR}>
              {Messages.REPLUGGED_ADDON_NOT_REVIEWED_DESC.format({
                type: label(getAddonType(manifest.type)),
              })}
            </Notice>
          </div>
        ) : null}
      </>
    ),
    confirmText: Messages.REPLUGGED_CONFIRM,
    cancelText: Messages.REPLUGGED_CANCEL,
    secondaryConfirmText: storeUrl ? Messages.REPLUGGED_INSTALLER_OPEN_STORE : undefined,
    onConfirmSecondary: () => (storeUrl ? openExternal(storeUrl) : null),
  });

  return res;
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
 * @param showToasts Whether to show toasts (default: true)
 * @param linkToStore Whether to link to the store page (default: true)
 * @returns
 */
export async function installFlow(
  identifier: string,
  source?: InstallerSource,
  id?: string,
  showToasts = true,
  linkToStore = true,
): Promise<InstallResponse> {
  const info = await getInfo(identifier, source, id);
  if (!info) {
    if (showToasts)
      toast.toast(Messages.REPLUGGED_TOAST_INSTALLER_ADDON_FETCH_INFO_FAILED, toast.Kind.FAILURE);
    return {
      kind: "FAILED",
    };
  }

  if (info.manifest.type === "replugged") {
    throw new Error("Cannot install Replugged itself");
  }

  if (checkIsInstalled(info)) {
    if (showToasts)
      toast.toast(
        Messages.REPLUGGED_ERROR_ALREADY_INSTALLED.format({ name: info.manifest.name }),
        toast.Kind.MESSAGE,
      );
    return {
      kind: "ALREADY_INSTALLED",
      manifest: info.manifest,
    };
  }

  window.DiscordNative.window.focus();

  const confirm = await showInstallPrompt(info.manifest, linkToStore);
  if (!confirm) {
    if (confirm === false && showToasts) {
      // Do not show if null ("open in store" clicked)
      toast.toast(Messages.REPLUGGED_TOAST_INSTALLER_ADDON_CANCELED_INSTALL, toast.Kind.MESSAGE);
    }
    return {
      kind: "CANCELLED",
      manifest: info.manifest,
    };
  }

  await install(info);

  if (
    info.manifest.type === "replugged-plugin" &&
    (info.manifest.reloadRequired ?? info.manifest.plaintextPatches)
  ) {
    void modal
      .confirm({
        title: Messages.REPLUGGED_UPDATES_AWAITING_RELOAD_TITLE,
        body: Messages.REPLUGGED_PLUGIN_INSTALL_RELOAD_PROMPT_BODY.format({
          name: info.manifest.name,
        }),
        confirmText: Messages.REPLUGGED_RELOAD,
        confirmColor: Button.Colors.RED,
      })
      .then((answer) => {
        if (answer) {
          setTimeout(() => window.location.reload(), 250);
        }
      });
  }

  return {
    kind: "SUCCESS",
    manifest: info.manifest,
  };
}
