import { ipcMain, shell } from "electron";
import { readFile, writeFile } from "fs/promises";
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

async function readSettings(namespace: string): Promise<Map<string, unknown>> {
  const path = getSettingsPath(namespace);
  try {
    const data = await readFile(path, "utf8");
    const parsedData: Record<string, unknown> = JSON.parse(data);
    return new Map(Object.entries(parsedData));
  } catch {
    return new Map();
  }
}

function writeSettings(namespace: string, settings: SettingsMap): Promise<void> {
  return writeFile(
    getSettingsPath(namespace),
    JSON.stringify(Object.fromEntries(settings.entries()), null, 2),
    "utf8",
  );
}

const locks: Record<string, Promise<unknown> | undefined> = {};

async function transaction<T>(namespace: string, handler: TransactionHandler<T>): Promise<T> {
  const lock = locks[namespace] ?? Promise.resolve();

  const result = lock.then(() => handler());

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  locks[namespace] = result.catch(() => {});
  return result;
}

export async function readTransaction<T>(
  namespace: string,
  handler: SettingsTransactionHandler<T>,
): Promise<T> {
  return transaction(namespace, async () => {
    const settings = await readSettings(namespace);
    return handler(settings);
  });
}

export async function writeTransaction<T>(
  namespace: string,
  handler: SettingsTransactionHandler<T>,
): Promise<T> {
  return transaction(namespace, async () => {
    const postHandlerTransform: Array<(settings: SettingsMap) => void | Promise<void>> = [];

    const settings = await readSettings(namespace);
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

    const res = await handler(settings);

    for (const transform of postHandlerTransform) {
      await transform(settings);
    }

    await writeSettings(namespace, settings);
    return res;
  });
}

export async function getSetting<T>(namespace: string, key: string, fallback: T): Promise<T>;
export async function getSetting<T>(
  namespace: string,
  key: string,
  fallback?: T,
): Promise<T | undefined>;
export async function getSetting<T>(
  namespace: string,
  key: string,
  fallback?: T,
): Promise<T | undefined> {
  const setting = (await readTransaction(namespace, (settings) => settings.get(key))) as T;
  return setting ?? fallback;
}

ipcMain.handle(RepluggedIpcChannels.GET_SETTING, async (_, namespace: string, key: string) =>
  getSetting(namespace, key),
);

ipcMain.handle(RepluggedIpcChannels.HAS_SETTING, async (_, namespace: string, key: string) =>
  readTransaction(namespace, (settings) => settings.has(key)),
);

ipcMain.handle(
  RepluggedIpcChannels.SET_SETTING,
  (_, namespace: string, key: string, value: unknown) =>
    void writeTransaction(namespace, (settings) => settings.set(key, value)),
);

ipcMain.handle(RepluggedIpcChannels.DELETE_SETTING, (_, namespace: string, key: string) =>
  writeTransaction(namespace, (settings) => settings.delete(key)),
);

ipcMain.handle(RepluggedIpcChannels.GET_ALL_SETTINGS, async (_, namespace: string) =>
  readTransaction(namespace, (settings) => Object.fromEntries(settings.entries())),
);

ipcMain.on(RepluggedIpcChannels.OPEN_SETTINGS_FOLDER, () => shell.openPath(SETTINGS_DIR));
