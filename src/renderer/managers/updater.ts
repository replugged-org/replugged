import * as common from "@common";
import type { ReCelledPlugin, ReCelledTheme } from "src/types";
import { AnyAddonManifest, ReCelledEntity } from "src/types/addon";
import notices from "../apis/notices";
import { init } from "../apis/settings";
import { t } from "../modules/i18n";
import { Logger } from "../modules/logger";
import { waitForProps } from "../modules/webpack";
import * as pluginManager from "./plugins";
import * as themeManager from "./themes";

const logger = Logger.coremod("Updater");

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type UpdateSettings = {
  available: boolean;
  version: string;
  url: string;
  webUrl?: string;
  lastChecked: number;
};
const RECELLED_ID = "dev.recelled.ReCelled";
const RECELLED_ENTITY: ReCelledEntity = {
  manifest: {
    id: RECELLED_ID,
    name: "ReCelled",
    description: "ReCelled itself",
    author: {
      name: "recelled",
      discordID: "1000992611840049192",
      github: "ReCelled",
    },
    type: "recelled",
    updater: {
      type: "github",
      id: "ReCelled/recelled",
    },
    version: window.ReCelledNative.getVersion(),
    license: "MIT",
  },
  path: "recelled.asar",
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type MainUpdaterSettings = {
  autoCheck?: boolean;
  checkIntervalMinutes?: number;
  lastChecked?: number;
};

const mainUpdaterDefaultSettings = {
  autoCheck: true,
  checkIntervalMinutes: 10,
  lastChecked: 0,
} satisfies Partial<MainUpdaterSettings>;

export const updaterSettings = init<MainUpdaterSettings, keyof typeof mainUpdaterDefaultSettings>(
  "dev.recelled.Updater",
  mainUpdaterDefaultSettings,
);

const updaterState = init<Record<string, UpdateSettings>>("dev.recelled.Updater.State");

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

export function setUpdaterState(id: string, state: UpdateSettings): void {
  updaterState.set(id, state);
}

async function getAddonFromManager(
  id: string,
): Promise<ReCelledPlugin | ReCelledTheme | ReCelledEntity | undefined> {
  if (id === RECELLED_ID) {
    const version = window.ReCelledNative.getVersion();
    if (version === "dev") return undefined;
    return RECELLED_ENTITY;
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

  const res = await window.ReCelledNative.updater.check(
    updater.type,
    updater.id,
    id === RECELLED_ID ? "recelled" : id,
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
  const res = await window.ReCelledNative.updater.install(
    entity.manifest.type,
    entity.path,
    updateSettings.url,
    updateSettings.version,
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

export async function checkAllUpdates(autoCheck = false, verbose = false): Promise<void> {
  const plugins = Array.from(pluginManager.plugins.values());
  const themes = await themeManager.list();

  // For auto checking, only check for store updates since GitHub has a higher rate limit
  const filterFn = autoCheck
    ? (addon: { manifest: AnyAddonManifest }) => addon.manifest.updater?.type === "store"
    : () => true;

  const addons = [...plugins, ...themes].filter(filterFn);

  logger.log("Checking for updates");

  await Promise.all([
    checkUpdate(RECELLED_ID, verbose),
    ...addons.map((addon) => checkUpdate(addon.manifest.id, verbose)),
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
        ((state.id === RECELLED_ID && window.ReCelledNative.getVersion() !== "dev") ||
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

let clearActiveNotification: (() => void) | null = null;
let didRun = false;
const openSettingsModPromise = waitForProps<{
  open: (id: string) => void;
  updateAccount: unknown;
}>("open", "updateAccount");

async function autoUpdateCheck(): Promise<void> {
  if (!updaterSettings.get("autoCheck")) return;

  const initialUpdateCount = getAvailableUpdates().length;
  const lastChecked = updaterSettings.get("lastChecked");
  const checkMs = updaterSettings.get("checkIntervalMinutes") * 60 * 1000;
  const lastCheckedAgo = Date.now() - lastChecked;
  // If it's not been long enough to check again, don't check
  // But we still want to try and show existing updates if they exist
  if (lastCheckedAgo >= checkMs) {
    logger.log("Checking for updates (auto)");
    await checkAllUpdates(true);
    updaterSettings.set("lastChecked", Date.now());
  } else {
    logger.log("Skipping update check since it's too soon since the last check");
  }

  // We only want to show a notification if:
  // - There is at least one update available
  // - There are new updates available since the last check, or this is the first run
  // This is to prevent spamming the user with notifications if they choose to ignore the update

  const newUpdateCount = getAvailableUpdates().length;
  const isAnUpdate = newUpdateCount > 0;
  const areNewUpdates = newUpdateCount > initialUpdateCount;
  const isFirstRun = !didRun;
  didRun = true;
  if (isAnUpdate && (areNewUpdates || isFirstRun)) {
    logger.log("Showing update notification");

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const intl = common.i18n?.intl; // Weird hack due to circular dependency
    const { open } = await openSettingsModPromise;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!intl) {
      logger.error("intl missing, cannot show update notification");
      return;
    }

    clearActiveNotification?.();
    clearActiveNotification = notices.sendAnnouncement({
      message: intl.format(t.RECELLED_UPDATES_AVAILABLE, {
        count: newUpdateCount,
      }),
      button: {
        text: intl.formatToPlainString(t.RECELLED_VIEW_UPDATES, {
          count: newUpdateCount,
        }),
        onClick: () => open("rc-updater"),
      },
    });
  }
}

// Check if updates need to be checked every minute
export function startAutoUpdateChecking(): void {
  setInterval(() => {
    autoUpdateCheck().catch((err) => logger.error("Error in update checking (loop)", err));
  }, 60 * 1000);
  autoUpdateCheck().catch((err) => logger.error("Error in update checking (initial)", err));
}
