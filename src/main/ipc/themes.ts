/*
IPC events:
- REPLUGGED_GET_THEME_CSS: returns compiled CSS for a theme by name
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/

import { readdir, readFile, rm } from 'fs/promises';
import { join, resolve } from 'path';
import { ipcMain } from 'electron';
import { RepluggedIpcChannels, RepluggedTheme } from '../../types';

const THEMES_DIR = resolve(__dirname, '../themes');

function validateThemeManifest (manifest: Record<string, unknown>) {
  for (const key of [
    'name',
    'description',
    'version',
    'author',
    'license',
    'main'
  ]) {
    if (!(key in manifest)) {
      return false;
    }
  }
  return true;
}

async function getTheme (themeName: string): Promise<RepluggedTheme> {
  const manifest: RepluggedTheme['manifest'] = JSON.parse(await readFile(join(
    THEMES_DIR,
    themeName,
    'manifest.json'
  ), {
    encoding: 'utf-8'
  }));

  if (validateThemeManifest(manifest)) {
    return {
      id: themeName,
      manifest
    };
  }

  throw new Error(`Invalid manifest for theme '${themeName}'`);
}

ipcMain.handle(RepluggedIpcChannels.LIST_THEMES, async (): Promise<RepluggedTheme[]> => {
  const themes = [];

  const themeDirs = (await readdir(THEMES_DIR, {
    withFileTypes: true
  })).filter(f => f.isDirectory());

  for (const themeDir of themeDirs) {
    try {
      themes.push(await getTheme(themeDir.name));
    } catch {}
  }

  return themes;
});

ipcMain.handle(
  RepluggedIpcChannels.UNINSTALL_THEME,
  async (_, themeName: string) => {
    await rm(join(THEMES_DIR, themeName), {
      recursive: true,
      force: true
    });
  }
);
