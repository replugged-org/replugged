import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ipcMain } from 'electron';
import { RepluggedIpcChannels } from '../../types';
import { Settings, SettingsTransactionHandler, TransactionHandler } from '../../types/settings';

const settingsPath = join(__dirname, '../settings');

async function readSettings (namespace: string) {
  try {
    const data = await readFile(join(settingsPath, `${namespace}.json`), 'utf8');
    return JSON.parse(data);
  } catch {
    return ({});
  }
}

function writeSettings (namespace: string, settings: Settings) {
  return writeFile(join(settingsPath, `${namespace}.json`), JSON.stringify(settings, null, 2), 'utf8');
}

const locks: Record<string, Promise<unknown>> = {};

async function transaction <T> (namespace: string, handler: TransactionHandler<T>) {
  const lock = locks[namespace] ?? Promise.resolve();

  const result = lock.then(() => handler());
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  locks[namespace] = result.catch(() => {});
  return result;
}

async function readTransaction <T> (namespace: string, handler: SettingsTransactionHandler<T>) {
  return transaction(namespace, async () => {
    const settings = await readSettings(namespace);
    return handler(settings);
  });
}

async function writeTransaction <T> (namespace: string, handler: SettingsTransactionHandler<T>) {
  return transaction(namespace, async () => {
    const settings = await readSettings(namespace);
    const res = await handler(settings);
    await writeSettings(namespace, settings);
    return res;
  });
}

const ipcTransactions: Record<string, (updated: Settings | null) => void> = {};

ipcMain.handle(RepluggedIpcChannels.GET_SETTING, async (event, namespace: string, key: string) => readTransaction(namespace, async (settings) => settings[key]));

ipcMain.handle(RepluggedIpcChannels.HAS_SETTING, async (event, namespace: string, key: string) => readTransaction(namespace, async (settings) => typeof settings[key] !== 'undefined'));

ipcMain.handle(RepluggedIpcChannels.SET_SETTING, (event, namespace: string, key: string, value: unknown) => writeTransaction(namespace, async (settings) => settings[key] = value));

ipcMain.handle(RepluggedIpcChannels.DELETE_SETTING, (event, namespace: string, key: string) => writeTransaction(namespace, async (settings) => delete settings[key]));

ipcMain.handle(RepluggedIpcChannels.GET_ALL_SETTINGS, async (event, namespace: string) => readTransaction(namespace, async (settings) => settings));

ipcMain.handle(RepluggedIpcChannels.START_SETTINGS_TRANSACTION, (event, namespace: string) => new Promise<Settings>((resolve) =>
  writeTransaction(namespace, async (settings) => new Promise<void>(transactionResolve => {
    ipcTransactions[namespace] = (updated: Settings | null) => {
      if (updated !== null) {
        Object.assign(settings, updated);
      }
      transactionResolve();
    };

    resolve(settings);
  }))
));

ipcMain.handle(RepluggedIpcChannels.END_SETTINGS_TRANSACTION, (event, namespace: string, settings: Settings | null) => {
  ipcTransactions[namespace]?.(settings);
  delete ipcTransactions[namespace];
});
