import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ipcMain, shell } from "electron";
import { RepluggedIpcChannels } from "../../types";
import type {
  SettingsMap,
  SettingsTransactionHandler,
  TransactionHandler,
} from "../../types/settings";
import { CONFIG_PATHS } from "src/util.mjs";

const SETTINGS_DIR = CONFIG_PATHS.settings;

async function readSettings(namespace: string): Promise<Map<string, unknown>> {
  try {
    const data = await readFile(join(SETTINGS_DIR, `${namespace}.json`), "utf8");
    return new Map(Object.entries(JSON.parse(data)));
  } catch {
    return new Map();
  }
}

function writeSettings(namespace: string, settings: SettingsMap): Promise<void> {
  return writeFile(
    join(SETTINGS_DIR, `${namespace}.json`),
    JSON.stringify(Object.fromEntries(settings.entries()), null, 2),
    "utf8",
  );
}

const locks: Record<string, Promise<unknown>> = {};

async function transaction<T>(namespace: string, handler: TransactionHandler<T>): Promise<T> {
  const lock = locks[namespace] ?? Promise.resolve();

  const result = lock.then(() => handler());

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
    const settings = await readSettings(namespace);
    const res = await handler(settings);
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
