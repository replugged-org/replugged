/*
IPC events:
- REPLUGGED_GET_THEME_CSS: returns compiled CSS for a theme by name
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/

import { readdir, readFile, rm } from 'fs/promises';
import { join, resolve, extname } from 'path';
import { ipcMain } from 'electron';
import { RepluggedIpcChannels, RepluggedTheme } from '../../types';
import { theme } from '../../types/addon';

const THEMES_DIR = resolve(__dirname, '../themes');

async function getTheme (themeName: string): Promise<RepluggedTheme> {
  const manifest: unknown = JSON.parse(await readFile(join(
    THEMES_DIR,
    themeName,
    'manifest.json'
  ), {
    encoding: 'utf-8'
  }));

  return {
    id: themeName,
    manifest: theme.parse(manifest)
  };
}

ipcMain.handle(RepluggedIpcChannels.LIST_THEMES, async (): Promise<RepluggedTheme[]> => {
  const themes = [];

  const themeDirs = (await readdir(THEMES_DIR, {
    withFileTypes: true
  })).filter(f => f.isDirectory() || (f.isFile() && extname(f.name) === '.asar'));

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
