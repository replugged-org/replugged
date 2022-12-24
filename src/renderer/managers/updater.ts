import settings from "../apis/settings";
import { get as getPlugin, reload as reloadPlugin } from "./plugins";
import { get as getTheme, reload as reloadTheme } from "./themes";
import { error, log, warn } from "../modules/logger";

interface UpdateSettings {
  available?: boolean;
  id?: string;
  url?: string;
  lastChecked?: number;
  hash?: string;
}

export async function getUpdateSettings(id: string): Promise<UpdateSettings> {
  const setting = await settings.get(id).get("_updater");
  if (!setting) return {};
  if (typeof setting !== "object") return {};
  if ("available" in setting && typeof setting.available !== "boolean") return {};
  if ("id" in setting && typeof setting.id !== "string") return {};
  if ("url" in setting && typeof setting.url !== "string") return {};
  if ("lastChecked" in setting && typeof setting.lastChecked !== "number") return {};
  return setting;
}

export async function setUpdateSettings(id: string, newSettings: UpdateSettings): Promise<void> {
  // @ts-expect-error issue with typedefs
  await settings.get(id).set("_updater", newSettings);
}

/**
 * @param id Entity ID to check updates for
 */
export async function checkUpdate(id: string): Promise<void> {
  const entity = (await getPlugin(id)) || (await getTheme(id));
  if (!entity) {
    error("Replugged", "Updater", void 0, `Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    error("Replugged", "Updater", void 0, `Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const updateSettings = await getUpdateSettings(id);

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

  if (res.id === updateSettings.id) {
    const hash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);
    if (hash !== updateSettings.hash) {
      warn("Replugged", "Updater", void 0, `Entity ${id}'s hash has changed, forcing update`);
    } else {
      log("Replugged", "Updater", void 0, `Entity ${id} is up to date`);
      void setUpdateSettings(id, {
        ...setUpdateSettings,
        available: false,
        lastChecked: Date.now(),
      });
      return;
    }
  }

  log("Replugged", "Updater", void 0, `Entity ${id} has an update available`);
  void setUpdateSettings(id, {
    available: true,
    id: res.id,
    url: res.url,
    lastChecked: Date.now(),
  });
}

export async function installUpdate(id: string): Promise<void> {
  const entity = (await getPlugin(id)) || (await getTheme(id));
  if (!entity) {
    error("Replugged", "Updater", void 0, `Entity ${id} not found`);
    return;
  }
  if (!entity.path.endsWith(".asar")) {
    error("Replugged", "Updater", void 0, `Entity ${id} is not an ASAR file, cannot be updated`);
    return;
  }

  const updateSettings = await getUpdateSettings(id);

  if (!updateSettings.available) {
    error("Replugged", "Updater", void 0, `Entity ${id} has no update available`);
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
        await reloadPlugin(id);
        break;
      case "replugged-theme":
        reloadTheme(id);
        break;
    }
  } catch (err) {
    error("Replugged", "Updater", void 0, `Update install failed: ${err}`);
    return;
  }

  const newHash = await window.RepluggedNative.updater.getHash(entity.manifest.type, entity.path);

  // update settings
  void setUpdateSettings(id, {
    ...updateSettings,
    available: false,
    hash: newHash,
  });

  log("Replugged", "Updater", void 0, `Entity ${id} updated successfully`);
}
