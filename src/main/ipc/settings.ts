import { ipcMain, shell } from "electron";
import { readFileSync, writeFileSync } from "fs";
import { resolve, sep } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { RepluggedIpcChannels } from "../../types";
import type {
  SettingsMap,
  SettingsTransactionHandler,
  TransactionHandler,
} from "../../types/settings";

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
    const parsedData: Record<string, unknown> = JSON.parse(data);
    return new Map(Object.entries(parsedData));
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

const locks: Record<string, boolean> = {};

function transaction<T>(namespace: string, handler: TransactionHandler<T>): T {
  if (locks[namespace]) {
    throw new Error(`Transaction already in progress for namespace: ${namespace}`);
  }

  locks[namespace] = true;
  try {
    return handler();
  } finally {
    locks[namespace] = false;
  }
}

export function readTransaction<T>(namespace: string, handler: SettingsTransactionHandler<T>): T {
  return transaction(namespace, () => {
    const settings = readSettings(namespace);
    return handler(settings);
  });
}

export function writeTransaction<T>(namespace: string, handler: SettingsTransactionHandler<T>): T {
  return transaction(namespace, () => {
    const postHandlerTransform: Array<(settings: SettingsMap) => void> = [];

    const settings = readSettings(namespace);
    if (namespace.toLowerCase() === "dev.replugged.settings") {
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

ipcMain.on(RepluggedIpcChannels.GET_SETTING, (event, namespace: string, key: string) => {
  event.returnValue = getSetting(namespace, key);
});

ipcMain.on(RepluggedIpcChannels.HAS_SETTING, (event, namespace: string, key: string) => {
  event.returnValue = readTransaction(namespace, (settings) => settings.has(key));
});

ipcMain.on(
  RepluggedIpcChannels.SET_SETTING,
  (event, namespace: string, key: string, value: unknown) => {
    event.returnValue = writeTransaction(namespace, (settings) => settings.set(key, value));
  },
);

ipcMain.on(RepluggedIpcChannels.DELETE_SETTING, (event, namespace: string, key: string) => {
  event.returnValue = writeTransaction(namespace, (settings) => settings.delete(key));
});

export function getAllSettings(namespace: string): Record<string, unknown> {
  return readTransaction(namespace, (settings) => Object.fromEntries(settings.entries()));
}

ipcMain.on(RepluggedIpcChannels.GET_ALL_SETTINGS, (event, namespace: string) => {
  event.returnValue = getAllSettings(namespace);
});

ipcMain.on(RepluggedIpcChannels.OPEN_SETTINGS_FOLDER, () => shell.openPath(SETTINGS_DIR));
