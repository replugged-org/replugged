import { init } from "../apis/settings";
import { get as getPlugin, list as listPlugins, reload as reloadPlugin } from "./plugins";
import { get as getTheme, list as listThemes, reload as reloadTheme } from "./themes";
import { error, log, warn } from "../modules/logger";

interface UpdateSettings {
  available?: boolean;
  id?: string;
  url?: string;
  lastChecked?: number;
  hash?: string;
}

interface EntitySettings {
  [key: string]: unknown;
  _updater: UpdateSettings;
}

const updaterSettings = await init<{
  waitSinceLastUpdate: number;
}>("dev.replugged.Updater");

export async function getUpdateSettings(id: string): Promise<UpdateSettings> {
  const setting = (await init<EntitySettings>(id)).get("_updater");
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

export async function setUpdateSettings(id: string, newSettings: UpdateSettings): Promise<void> {
  (await init<EntitySettings>(id)).set("_updater", newSettings);
}

/**
 * @param id Entity ID to check updates for
 */
export async function checkUpdate(
  id: string,
  waitSinceLastUpdate = 0,
  verbose = true,
): Promise<void> {
  const entity = (await getPlugin(id)) || (await getTheme(id));
  if (!entity) {
    error("Replugged", "Updater", void 0, `Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose)
      log("Replugged", "Updater", void 0, `Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const updateSettings = await getUpdateSettings(id);

  const hash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);

  if (
    updateSettings.lastChecked &&
    Date.now() - updateSettings.lastChecked < waitSinceLastUpdate &&
    updateSettings.hash === hash
  ) {
    if (verbose) log("Replugged", "Updater", void 0, `Entity ${id} was checked recently, skipping`);
    return;
  }

  const {
    manifest: { updater },
  } = entity;
  if (!updater) {
    error("Replugged", "Updater", void 0, `Entity ${id} has no updater info`);
    return;
  }

  const res = await window.RepluggedNative.updater.check(updater.type, updater.id);

  if (!res.success) {
    error("Replugged", "Updater", void 0, `Update check failed: ${res.error}`);
    return;
  }

  if (!updateSettings.id) {
    warn("Replugged", "Updater", void 0, `Entity ${id} has not been checked before, skipping`);
    await setUpdateSettings(id, {
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
      warn("Replugged", "Updater", void 0, `Entity ${id}'s hash has changed, forcing update`);
    } else {
      if (verbose) log("Replugged", "Updater", void 0, `Entity ${id} is up to date`);
      await setUpdateSettings(id, {
        available: false,
        lastChecked: Date.now(),
        hash,
        url: res.url,
        id: res.id,
      });
      return;
    }
  }

  log("Replugged", "Updater", void 0, `Entity ${id} has an update available`);
  await setUpdateSettings(id, {
    available: true,
    id: res.id,
    url: res.url,
    lastChecked: Date.now(),
    hash,
  });
}

export async function installUpdate(id: string, force = false, verbose = true): Promise<void> {
  const entity = (await getPlugin(id)) || (await getTheme(id));
  if (!entity) {
    error("Replugged", "Updater", void 0, `Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    if (verbose)
      log("Replugged", "Updater", void 0, `Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const updateSettings = await getUpdateSettings(id);

  if (!force && !updateSettings.available) {
    if (verbose) log("Replugged", "Updater", void 0, `Entity ${id} has no update available`);
    return;
  }

  if (!updateSettings.url) {
    error("Replugged", "Updater", void 0, `Entity ${id} has no update URL`);
    return;
  }

  // install new
  const res = await window.RepluggedNative.updater.install(
    entity.manifest.type,
    entity.path,
    updateSettings.url,
  );

  if (!res.success) {
    error("Replugged", "Updater", void 0, `Update install failed: ${res.error}`);
    return;
  }

  // start new
  try {
    switch (entity.manifest.type) {
      case "replugged-plugin":
        await reloadPlugin(`${id}.asar`);
        break;
      case "replugged-theme":
        reloadTheme(`${id}.asar`);
        break;
    }
  } catch (err) {
    error("Replugged", "Updater", void 0, `Update install failed: ${err}`);
    return;
  }

  const newHash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);

  // update settings
  await setUpdateSettings(id, {
    ...updateSettings,
    available: false,
    hash: newHash,
  });

  log("Replugged", "Updater", void 0, `Entity ${id} updated successfully`);
}

export async function checkAllUpdates(
  waitSinceLastUpdate?: number | undefined,
  verbose = false,
): Promise<void> {
  if (waitSinceLastUpdate === undefined) {
    waitSinceLastUpdate = updaterSettings.get("waitSinceLastUpdate") || 1000 * 60 * 60 * 15;
  }

  const plugins = await listPlugins();
  const themes = await listThemes();

  log("Replugged", "Updater", void 0, "Checking for updates");

  await Promise.all([
    plugins.map((plugin) => checkUpdate(plugin.manifest.id, waitSinceLastUpdate, verbose)),
    themes.map((theme) => checkUpdate(theme.manifest.id, waitSinceLastUpdate, verbose)),
  ]);

  log("Replugged", "Updater", void 0, "All updates checked");
}

export async function installAllUpdates(force = false, verbose = false): Promise<void> {
  const plugins = await listPlugins();
  const themes = await listThemes();

  log("Replugged", "Updater", void 0, "Installing updates");

  await Promise.all([
    plugins.map((plugin) => installUpdate(plugin.manifest.id, force, verbose)),
    themes.map((theme) => installUpdate(theme.manifest.id, force, verbose)),
  ]);

  log("Replugged", "Updater", void 0, "All updates installed");
}
