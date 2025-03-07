import { i18n, modal, toast } from "@common";
import { Button, Notice } from "@components";
import { Logger } from "@recelled";
import { setUpdaterState } from "src/renderer/managers/updater";
import { openExternal } from "src/renderer/util";
import type { AnyAddonManifest, CheckResultSuccess } from "src/types";
import * as pluginManager from "../../managers/plugins";
import * as themeManager from "../../managers/themes";
import { generalSettings, getAddonType, getSourceLink, label } from "../settings/pages";
import { t } from "src/renderer/modules/i18n";

const { intl } = i18n;

const logger = Logger.coremod("Installer");

// First item is the default
export const INSTALLER_SOURCES = ["store", "github"] as const;
export type InstallerSource = (typeof INSTALLER_SOURCES)[number];
const DEFAULT_INSTALLER_SOURCE: InstallerSource = "store";

const CACHE_INTERVAL = 1000 * 60 * 60;

const cache = new Map<string, { data: CheckResultSuccess | null; expires: Date }>();

export function isValidSource(type: string): type is InstallerSource {
  // @ts-expect-error Doesn't matter that it might not be a valid type
  return INSTALLER_SOURCES.includes(type);
}

export interface InstallLinkProps {
  /** Identifier for the addon in the source */
  identifier: string;
  /** Updater source type */
  source?: InstallerSource;
  /** ID for the addon in that source. Useful for GitHub repositories that have multiple addons. */
  id?: string;
}

export function parseInstallLink(href: string): InstallLinkProps | null {
  try {
    const url = new URL(href);
    const repluggedHostname = new URL(generalSettings.get("apiUrl")).hostname;
    if (url.hostname !== repluggedHostname) return null;

    if (url.pathname === "/install") {
      const params = url.searchParams;
      const identifier = params.get("identifier");
      const source = params.get("source") ?? "store";
      const id = params.get("id") ?? undefined;
      if (!identifier) return null;
      if (!isValidSource(source)) return null;
      return {
        identifier,
        source,
        id,
      };
    }

    const storeMatch = url.pathname.match(/^\/store\/([^/]+)$/);
    if (storeMatch) {
      const identifier = storeMatch[1];
      if (["plugins", "themes"].includes(identifier.toLowerCase())) return null;
      return {
        identifier,
        source: "store",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getInfo(
  identifier: string,
  source?: InstallerSource,
  id?: string,
): Promise<CheckResultSuccess | null> {
  source ??= DEFAULT_INSTALLER_SOURCE;

  const cacheIdentifier = `${source}:${identifier}:${id ?? ""}`;
  const cached = cache.get(cacheIdentifier);
  if (cached && cached.expires > new Date()) {
    return cached.data;
  }

  const info = await ReCelledNative.installer.getInfo(source, identifier, id);
  if (!info.success) {
    logger.error(`Failed to get info for ${identifier}: ${info.error}`);
    cache.set(cacheIdentifier, {
      data: null,
      expires: new Date(Date.now() + CACHE_INTERVAL),
    });
    return null;
  }
  if (info.manifest.type === "recelled") {
    logger.error("Cannot install ReCelled itself");
    return null;
  }

  cache.set(cacheIdentifier, {
    data: info,
    expires: new Date(Date.now() + CACHE_INTERVAL),
  });

  return info;
}

export function checkIsInstalled(data: CheckResultSuccess): boolean {
  if (data.manifest.type === "recelled") {
    throw new Error("Cannot check ReCelled itself");
  }

  switch (data.manifest.type) {
    case "replugged-plugin":
      return pluginManager.plugins.has(data.manifest.id);
    case "replugged-theme":
      return themeManager.themes.has(data.manifest.id);
  }
}

export async function loadNew(data: CheckResultSuccess): Promise<boolean> {
  if (data.manifest.type === "recelled") {
    throw new Error("Cannot load ReCelled itself");
  }

  try {
    switch (data.manifest.type) {
      case "replugged-plugin":
        pluginManager.loadAll();
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
  if (data.manifest.type === "recelled") {
    throw new Error("Cannot install ReCelled itself");
  }

  const {
    url,
    webUrl,
    manifest: { name, type, id, version },
  } = data;

  const res = await ReCelledNative.installer.install(
    type,
    `${id}.asar`,
    url,
    data.manifest.version,
  );
  if (!res.success) {
    logger.error(`Failed to install ${name}: ${res.error}`);
    toast.toast(
      intl.formatToPlainString(t.RECELLED_TOAST_INSTALLER_ADDON_INSTALL_FAILED, { name }),
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
      intl.formatToPlainString(t.RECELLED_TOAST_INSTALLER_ADDON_LOAD_FAILED, { name }),
      toast.Kind.FAILURE,
    );
    return false;
  }

  toast.toast(
    intl.formatToPlainString(t.RECELLED_TOAST_INSTALLER_ADDON_INSTALL_SUCCESS, { name }),
    toast.Kind.SUCCESS,
  );
  return true;
}

export function authorList(authors: string[]): string {
  if (authors.length === 1) {
    return intl.formatToPlainString(t.RECELLED_ADDON_AUTHORS_ONE, {
      author1: authors[0],
    });
  }
  if (authors.length === 2) {
    return intl.formatToPlainString(t.RECELLED_ADDON_AUTHORS_TWO, {
      author1: authors[0],
      author2: authors[1],
    });
  }
  if (authors.length === 3) {
    return intl.formatToPlainString(t.RECELLED_ADDON_AUTHORS_THREE, {
      author1: authors[0],
      author2: authors[1],
      author3: authors[2],
    });
  }

  return intl.formatToPlainString(t.RECELLED_ADDON_AUTHORS_MANY, {
    author1: authors[0],
    author2: authors[1],
    author3: authors[2],
    count: authors.length - 3,
  });
}

async function showInstallPrompt(
  manifest: AnyAddonManifest,
  source: InstallerSource | undefined,
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

  const title = intl.format(t.RECELLED_INSTALL_MODAL_HEADER, { type });
  const text = intl.format(t.RECELLED_INSTALLER_INSTALL_PROMPT_BODY, {
    name: manifest.name,
    authors,
  });

  const storeUrl = linkToStore ? getSourceLink(manifest) : undefined;

  const res = await modal.confirm({
    title,
    body: (
      <>
        {text}
        {(source ?? DEFAULT_INSTALLER_SOURCE) !== "store" ? (
          <div style={{ marginTop: "16px" }}>
            <Notice messageType={Notice.Types.ERROR}>
              {intl.format(t.RECELLED_ADDON_NOT_REVIEWED_DESC, {
                type: label(getAddonType(manifest.type)),
              })}
            </Notice>
          </div>
        ) : null}
      </>
    ),
    confirmText: intl.string(t.RECELLED_CONFIRM),
    cancelText: intl.string(t.RECELLED_CANCEL),
    secondaryConfirmText: storeUrl ? intl.string(t.RECELLED_INSTALLER_OPEN_STORE) : undefined,
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
      toast.toast(
        intl.string(t.RECELLED_TOAST_INSTALLER_ADDON_FETCH_INFO_FAILED),
        toast.Kind.FAILURE,
      );
    return {
      kind: "FAILED",
    };
  }

  if (info.manifest.type === "recelled") {
    throw new Error("Cannot install ReCelled itself");
  }

  if (checkIsInstalled(info)) {
    if (showToasts)
      toast.toast(
        intl.formatToPlainString(t.RECELLED_ERROR_ALREADY_INSTALLED, { name: info.manifest.name }),
        toast.Kind.MESSAGE,
      );
    return {
      kind: "ALREADY_INSTALLED",
      manifest: info.manifest,
    };
  }

  window.DiscordNative.window.focus();

  const confirm = await showInstallPrompt(info.manifest, source, linkToStore);
  if (!confirm) {
    if (confirm === false && showToasts) {
      // Do not show if null ("open in store" clicked)
      toast.toast(
        intl.string(t.RECELLED_TOAST_INSTALLER_ADDON_CANCELED_INSTALL),
        toast.Kind.MESSAGE,
      );
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
        title: intl.string(t.RECELLED_UPDATES_AWAITING_RELOAD_TITLE),
        body: intl.format(t.RECELLED_PLUGIN_INSTALL_RELOAD_PROMPT_BODY, {
          name: info.manifest.name,
        }),
        confirmText: intl.string(t.RECELLED_RELOAD),
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
