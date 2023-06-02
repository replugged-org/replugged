import { init } from "../apis/settings";
import * as pluginManager from "./plugins";
import * as themeManager from "./themes";
import { Logger } from "../modules/logger";
import type { RepluggedPlugin, RepluggedTheme } from "src/types";
import { RepluggedEntity } from "src/types/addon";

const logger = Logger.coremod("Updater");

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type UpdateSettings = {
  available: boolean;
  version: string;
  url: string;
  webUrl?: string;
  lastChecked: number;
};

const REPLUGGED_ID = "dev.replugged.Replugged";
const REPLUGGED_ENTITY: RepluggedEntity = {
  manifest: {
    id: REPLUGGED_ID,
    name: "Replugged",
    description: "Replugged itself",
    author: {
      name: "replugged",
      discordID: "1000992611840049192",
      github: "replugged-org",
    },
    type: "replugged",
    updater: {
      type: "store",
      id: REPLUGGED_ID,
    },
    version: window.RepluggedNative.getVersion(),
    license: "MIT",
  },
  path: "replugged.asar",
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type MainUpdaterSettings = {
  // Todo: implement
  checkInterval?: number;
  lastChecked?: number;
};

const mainUpdaterDefaultSettings: Partial<MainUpdaterSettings> = {
  checkInterval: 1000 * 60 * 60,
};

const updaterSettings = await init<MainUpdaterSettings, keyof typeof mainUpdaterDefaultSettings>(
  "dev.replugged.Updater",
  mainUpdaterDefaultSettings,
);

const updaterState = await init<Record<string, UpdateSettings>>("dev.replugged.Updater.State");

const completedUpdates = new Set<string>();

export function getUpdateState(id: string): UpdateSettings | null {
  const setting = updaterState.get(id);
  if (!setting) return null;
  if (typeof setting !== "object") return null;
  if (
    !("available" in setting) ||
    typeof (setting as { available: unknown }).available !== "boolean"
  )
    return null;
  if (!("version" in setting) || typeof (setting as { version: unknown }).version !== "string")
    return null;
  if (!("url" in setting) || typeof (setting as { url: unknown }).url !== "string") return null;
  if ("url" in setting && typeof (setting as { url: unknown }).url !== "string") return null;
  if (
    !("lastChecked" in setting) ||
    typeof (setting as { lastChecked: unknown }).lastChecked !== "number"
  )
    return null;
  return setting;
}

export function getMainUpdaterSettings(): MainUpdaterSettings {
  return updaterSettings.all();
}

export function setUpdaterState(id: string, state: UpdateSettings): void {
  updaterState.set(id, state);
}

async function getAddonFromManager(
  id: string,
): Promise<RepluggedPlugin | RepluggedTheme | RepluggedEntity | undefined> {
  if (id === REPLUGGED_ID) {
    const version = window.RepluggedNative.getVersion();
    if (version === "dev") return undefined;
    return REPLUGGED_ENTITY;
  }

  return pluginManager.plugins.get(id) || (await themeManager.get(id));
}

/**
 * @param id Entity ID to check updates for
 */
export async function checkUpdate(id: string, verbose = true): Promise<void> {
  const entity = await getAddonFromManager(id);
  if (!entity) {
    logger.error(`Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose) logger.log(`Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const {
    manifest: { updater, version },
  } = entity;
  if (!updater) {
    logger.warn(`Entity ${id} has no updater info`);
    return;
  }

  const res = await window.RepluggedNative.updater.check(
    updater.type,
    updater.id,
    id === REPLUGGED_ID ? "replugged" : id,
  );

  if (!res.success) {
    logger.error(`Update check for entity ${id} failed: ${res.error}`);
    return;
  }

  const newVersion = res.manifest.version;

  if (newVersion === version) {
    if (verbose) logger.log(`Entity ${id} is up to date`);
    updaterState.set(id, {
      available: false,
      lastChecked: Date.now(),
      url: res.url,
      webUrl: res.webUrl,
      version: newVersion,
    });
    return;
  }

  logger.log(`Entity ${id} has an update available`);
  updaterState.set(id, {
    available: true,
    url: res.url,
    webUrl: res.webUrl,
    lastChecked: Date.now(),
    version: newVersion,
  });
}

export async function installUpdate(id: string, force = false, verbose = true): Promise<boolean> {
  const entity = await getAddonFromManager(id);
  if (!entity) {
    logger.error(`Entity ${id} not found`);
    return false;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose) logger.log(`Entity ${id} is not an ASAR file, cannot be updated`);
    return false;
  }

  const updateSettings = getUpdateState(id);

  if (!force && !updateSettings?.available) {
    if (verbose) logger.log(`Entity ${id} has no update available`);
    return false;
  }

  if (!updateSettings?.url) {
    logger.error(`Entity ${id} has no update URL`);
    return false;
  }

  // install new
  const res = await window.RepluggedNative.updater.install(
    entity.manifest.type,
    entity.path,
    updateSettings.url,
  );

  if (!res.success) {
    logger.error(`Update install failed: ${res.error}`);
    return false;
  }

  // update settings
  updaterState.set(id, {
    ...updateSettings,
    available: false,
  });

  completedUpdates.add(id);

  logger.log(`Entity ${id} updated successfully`);

  return true;
}

export async function checkAllUpdates(verbose = false): Promise<void> {
  const plugins = Array.from(pluginManager.plugins.values());
  const themes = await themeManager.list();

  logger.log("Checking for updates");

  await Promise.all([
    checkUpdate(REPLUGGED_ID, verbose),
    ...plugins.map((plugin) => checkUpdate(plugin.manifest.id, verbose)),
    ...themes.map((theme) => checkUpdate(theme.manifest.id, verbose)),
  ]);

  logger.log("All updates checked");
  updaterSettings.set("lastChecked", Date.now());
}

export function getAvailableUpdates(): Array<UpdateSettings & { id: string }> {
  return Object.entries(updaterState.all())
    .map(([id, state]) => ({ ...state, id }))
    .filter(
      (state) =>
        (state.available || completedUpdates.has(state.id)) &&
        ((state.id === REPLUGGED_ID && window.RepluggedNative.getVersion() !== "dev") ||
          pluginManager.plugins.has(state.id) ||
          themeManager.themes.has(state.id)),
    );
}

export function installAllUpdates(
  force = false,
  verbose = false,
): Record<string, Promise<boolean>> {
  const available = getAvailableUpdates();

  return Object.fromEntries(
    available.map((update) => [update.id, installUpdate(update.id, force, verbose)]),
  );
}
