import { init } from "../apis/settings";
import * as pluginManager from "./plugins";
import * as themeManager from "./themes";
import { Logger } from "../modules/logger";

const logger = Logger.coremod("Updater");

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type UpdateSettings = {
  available?: boolean;
  id?: string;
  url?: string;
  lastChecked?: number;
  hash?: string;
};

const updaterSettings = await init<{
  waitSinceLastUpdate: number;
}>("dev.replugged.Updater");

const updaterState = await init<Record<string, UpdateSettings>>("dev.replugged.Updater.State");

export function getUpdateSettings(id: string): UpdateSettings {
  const setting = updaterState.get(id);
  if (!setting) return {};
  if (typeof setting !== "object") return {};
  if ("available" in setting && typeof (setting as { available: unknown }).available !== "boolean")
    return {};
  if ("id" in setting && typeof (setting as { id: unknown }).id !== "string") return {};
  if ("url" in setting && typeof (setting as { url: unknown }).url !== "string") return {};
  if (
    "lastChecked" in setting &&
    typeof (setting as { lastChecked: unknown }).lastChecked !== "number"
  )
    return {};
  return setting;
}

/**
 * @param id Entity ID to check updates for
 */
export async function checkUpdate(
  id: string,
  waitSinceLastUpdate = 0,
  verbose = true,
): Promise<void> {
  const entity = pluginManager.plugins.get(id) || (await themeManager.get(id));
  if (!entity) {
    logger.error(`Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose) logger.log(`Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const updateSettings = getUpdateSettings(id);

  const hash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);

  if (
    updateSettings.lastChecked &&
    Date.now() - updateSettings.lastChecked < waitSinceLastUpdate &&
    updateSettings.hash === hash
  ) {
    if (verbose) logger.log(`Entity ${id} was checked recently, skipping`);
    return;
  }

  const {
    manifest: { updater },
  } = entity;
  if (!updater) {
    logger.warn(`Entity ${id} has no updater info`);
    return;
  }

  const res = await window.RepluggedNative.updater.check(updater.type, updater.id, id);

  if (!res.success) {
    logger.error(`Update check for entity ${id} failed: ${res.error}`);
    return;
  }

  if (!updateSettings.id) {
    logger.warn(`Entity ${id} has not been checked before, skipping`);
    updaterState.set(id, {
      available: false,
      lastChecked: Date.now(),
      hash,
      url: res.url,
      id: res.id,
    });
    return;
  }

  if (res.id === updateSettings.id) {
    const hash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);
    if (hash !== updateSettings.hash) {
      logger.warn(`Entity ${id}'s hash has changed, forcing update`);
    } else {
      if (verbose) logger.log(`Entity ${id} is up to date`);
      updaterState.set(id, {
        available: false,
        lastChecked: Date.now(),
        hash,
        url: res.url,
        id: res.id,
      });
      return;
    }
  }

  logger.log(`Entity ${id} has an update available`);
  updaterState.set(id, {
    available: true,
    id: res.id,
    url: res.url,
    lastChecked: Date.now(),
    hash,
  });
}

export async function installUpdate(id: string, force = false, verbose = true): Promise<boolean> {
  const entity = pluginManager.plugins.get(id) || (await themeManager.get(id));
  if (!entity) {
    logger.error(`Entity ${id} not found`);
    return false;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose) logger.log(`Entity ${id} is not an ASAR file, cannot be updated`);
    return false;
  }

  const updateSettings = getUpdateSettings(id);

  if (!force && !updateSettings.available) {
    if (verbose) logger.log(`Entity ${id} has no update available`);
    return false;
  }

  if (!updateSettings.url) {
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

  const newHash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);

  // update settings
  updaterState.set(id, {
    ...updateSettings,
    available: false,
    hash: newHash,
  });

  // Temporarily disabled until we can figure out how to properly reload compiled plugins
  // try {
  //   switch (entity.manifest.type) {
  //     case "replugged-plugin":
  //       await pluginManager.reload(`${id}.asar`);
  //       break;
  //     case "replugged-theme":
  //       themeManager.reload(`${id}.asar`);
  //       break;
  //   }
  // } catch (err) {
  //   logger.error(`Update install failed: ${err}`);
  //   return;
  // }

  logger.log(`Entity ${id} updated successfully`);

  return true;
}

export async function checkAllUpdates(
  waitSinceLastUpdate?: number | undefined,
  verbose = false,
): Promise<void> {
  if (waitSinceLastUpdate === undefined) {
    waitSinceLastUpdate = updaterSettings.get("waitSinceLastUpdate") || 1000 * 60 * 60 * 15;
  }

  const plugins = Array.from(pluginManager.plugins.values());
  const themes = await themeManager.list();

  logger.log("Checking for updates");

  await Promise.all([
    ...plugins.map((plugin) => checkUpdate(plugin.manifest.id, waitSinceLastUpdate, verbose)),
    ...themes.map((theme) => checkUpdate(theme.manifest.id, waitSinceLastUpdate, verbose)),
  ]);

  logger.log("All updates checked");
}

export async function installAllUpdates(force = false, verbose = false): Promise<void> {
  const plugins = Array.from(pluginManager.plugins.values());
  const themes = await themeManager.list();

  const successes = await Promise.all([
    ...plugins.map((plugin) => installUpdate(plugin.manifest.id, force, verbose)),
    ...themes.map((theme) => installUpdate(theme.manifest.id, force, verbose)),
  ]);

  if (successes.some(Boolean)) {
    logger.warn("Please fully quit and restart Replugged to apply updates");
  } else {
    logger.log("No updates installed");
  }
}
