/*
IPC events:
- RECELLED_LIST_THEMES: returns an array of all valid themes available
- RECELLED_UNINSTALL_THEME: uninstalls a theme by name
*/

import { readFile, readdir, readlink, rm, stat } from "fs/promises";
import { extname, join, sep } from "path";
import { ipcMain, shell } from "electron";
import { ReCelledIpcChannels, type ReCelledTheme } from "../../types";
import { theme } from "../../types/addon";
import { CONFIG_PATHS } from "src/util.mjs";
import type { Dirent, Stats } from "fs";

const THEMES_DIR = CONFIG_PATHS.themes;

export const isFileATheme = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

async function getTheme(path: string): Promise<ReCelledTheme> {
  const manifestPath = join(THEMES_DIR, path, "manifest.json");
  if (!manifestPath.startsWith(`${THEMES_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid theme name");
  }

  const manifest: unknown = JSON.parse(
    await readFile(manifestPath, {
      encoding: "utf-8",
    }),
  );

  return {
    path,
    manifest: theme.parse(manifest),
  };
}

ipcMain.handle(
  ReCelledIpcChannels.GET_THEME,
  async (_, path: string): Promise<ReCelledTheme | undefined> => {
    try {
      return await getTheme(path);
    } catch {}
  },
);

ipcMain.handle(ReCelledIpcChannels.LIST_THEMES, async (): Promise<ReCelledTheme[]> => {
  const themes = [];

  const themeDirs = (
    await Promise.all(
      (
        await readdir(THEMES_DIR, {
          withFileTypes: true,
        })
      ).map(async (f) => {
        if (isFileATheme(f, f.name)) return f;
        if (f.isSymbolicLink()) {
          const actualPath = await readlink(join(THEMES_DIR, f.name));
          const actualFile = await stat(actualPath);
          if (isFileATheme(actualFile, actualPath)) return f;
        }
      }),
    )
  ).filter(Boolean) as Dirent[];

  for (const themeDir of themeDirs) {
    try {
      themes.push(await getTheme(themeDir.name));
    } catch (e) {
      console.error(e);
    }
  }

  return themes;
});

ipcMain.handle(ReCelledIpcChannels.UNINSTALL_THEME, async (_, themeName: string) => {
  const themePath = join(THEMES_DIR, themeName);
  if (!themePath.startsWith(`${THEMES_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid theme name");
  }

  await rm(themePath, {
    recursive: true,
    force: true,
  });
});

ipcMain.on(ReCelledIpcChannels.OPEN_THEMES_FOLDER, () => shell.openPath(THEMES_DIR));
