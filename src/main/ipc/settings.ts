import { resolve, sep } from "path";
import { ipcMain, shell } from "electron";
import { ReCelledIpcChannels } from "../../types";
import type {
  SettingsMap,
  SettingsTransactionHandler,
  TransactionHandler,
} from "../../types/settings";
import { CONFIG_PATHS } from "src/util.mjs";
import { readFileSync, writeFileSync } from "fs";

const SETTINGS_DIR = CONFIG_PATHS.settings;

export function getSettingsPath(namespace: string): string {
  const resolved = resolve(SETTINGS_DIR, `${namespace}.json`);
  if (!resolved.startsWith(`${SETTINGS_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid namespace");
  }
  return resolved;
}

function readSettings(namespace: string): Map<string, unknown> {
  const path = getSettingsPath(namespace);
  try {
    const data = readFileSync(path, "utf8");
    return new Map(Object.entries(JSON.parse(data)));
  } catch {
    return new Map();
  }
}

function writeSettings(namespace: string, settings: SettingsMap): void {
  writeFileSync(
    getSettingsPath(namespace),
    JSON.stringify(Object.fromEntries(settings.entries()), null, 2),
    "utf8",
  );
}

const locks: Record<string, (() => unknown) | undefined> = {};

function transaction<T>(namespace: string, handler: TransactionHandler<T>): T {
  const lock = locks[namespace];

  if (lock) lock();

  const result = handler();

  locks[namespace] = () => result;
  return result;
}

export function readTransaction<T>(namespace: string, handler: SettingsTransactionHandler<T>): T {
  return transaction(namespace, () => {
    const settings = readSettings(namespace);
    return handler(settings);
  });
}

export function writeTransaction<T>(namespace: string, handler: SettingsTransactionHandler<T>): T {
  return transaction(namespace, () => {
    const postHandlerTransform: Array<(settings: SettingsMap) => void | void> = [];

    const settings = readSettings(namespace);
    if (namespace.toLowerCase() === "dev.recelled.settings") {
      // Prevent the "apiUrl" setting from changing
      const originalValue = settings.get("apiUrl");
      postHandlerTransform.push((settings) => {
        if (originalValue) {
          settings.set("apiUrl", originalValue);
        } else {
          settings.delete("apiUrl");
        }
      });
    }

    const res = handler(settings);

    for (const transform of postHandlerTransform) {
      transform(settings);
    }

    writeSettings(namespace, settings);
    return res;
  });
}

export function getSetting<T>(namespace: string, key: string, fallback: T): T;
export function getSetting<T>(namespace: string, key: string, fallback?: T): T | undefined;
export function getSetting<T>(namespace: string, key: string, fallback?: T): T | undefined {
  const setting = readTransaction(namespace, (settings) => settings.get(key)) as T;
  return setting ?? fallback;
}

ipcMain.on(
  ReCelledIpcChannels.GET_SETTING,
  (event, namespace: string, key: string) => (event.returnValue = getSetting(namespace, key)),
);

ipcMain.on(
  ReCelledIpcChannels.HAS_SETTING,
  (event, namespace: string, key: string) =>
    (event.returnValue = readTransaction(namespace, (settings) => settings.has(key))),
);

ipcMain.on(
  ReCelledIpcChannels.SET_SETTING,
  (event, namespace: string, key: string, value: unknown) =>
    (event.returnValue = writeTransaction(namespace, (settings) => settings.set(key, value))),
);

ipcMain.on(
  ReCelledIpcChannels.DELETE_SETTING,
  (event, namespace: string, key: string) =>
    (event.returnValue = writeTransaction(namespace, (settings) => settings.delete(key))),
);

ipcMain.on(
  ReCelledIpcChannels.GET_ALL_SETTINGS,
  (event, namespace: string) =>
    (event.returnValue = readTransaction(namespace, (settings) =>
      Object.fromEntries(settings.entries()),
    )),
);

ipcMain.on(ReCelledIpcChannels.OPEN_SETTINGS_FOLDER, () => shell.openPath(SETTINGS_DIR));
