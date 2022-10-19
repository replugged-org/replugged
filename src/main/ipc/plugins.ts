/*
IPC events:
- REPLUGGED_LIST_PLUGINS: returns an array of the names of all installed plugins
- REPLUGGED_UNINSTALL_PLUGIN: returns whether a plugin by the provided name was successfully uninstalled
*/

import { readdir, readFile, rm } from 'fs/promises';
import path, { join, resolve } from 'path';
import { ipcMain } from 'electron';
import { RepluggedIpcChannels, RepluggedPlugin } from '../../types';
import { plugin } from '../../types/addon';

const PLUGINS_DIR = resolve(__dirname, '../plugins');

async function getPlugin (pluginName: string): Promise<RepluggedPlugin> {
  const manifest: unknown = JSON.parse(await readFile(join(
    PLUGINS_DIR,
    pluginName,
    'manifest.json'
  ), {
    encoding: 'utf-8'
  }));

  return {
    id: pluginName,
    manifest: plugin.parse(manifest)
  };
}

ipcMain.handle(RepluggedIpcChannels.LIST_PLUGINS, async (): Promise<RepluggedPlugin[]> => {
  const plugins = [];

  const pluginDirs = (await readdir(PLUGINS_DIR, {
    withFileTypes: true
  })).filter(f => f.isDirectory() || (f.isFile() && path.extname(f.name) === '.asar'));

  for (const pluginDir of pluginDirs) {
    try {
      plugins.push(await getPlugin(pluginDir.name));
    } catch {}
  }

  return plugins;
});

ipcMain.handle(
  RepluggedIpcChannels.UNINSTALL_PLUGIN,
  async (_, pluginName: string) => {
    await rm(join(PLUGINS_DIR, pluginName), {
      recursive: true,
      force: true
    });
  }
);
