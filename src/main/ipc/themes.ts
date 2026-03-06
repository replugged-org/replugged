/*
IPC events:
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/

import { ipcMain, shell } from "electron";
import { rm } from "fs/promises";
import {
  type Dirent,
  type Stats,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  statSync,
} from "original-fs";
import { extname, join, sep } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { RepluggedIpcChannels, type RepluggedTheme } from "../../types";
import { type ThemeManifest, theme } from "../../types/addon";
import { extractAll } from "../asar";

const THEMES_DIR = CONFIG_PATHS.themes;

export const isFileATheme = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

function getTheme(path: string): RepluggedTheme {
  const themeFilePath = join(THEMES_DIR, path);

  // Extract asar themes
  if (path.endsWith(".asar") && statSync(themeFilePath).isFile()) {
    const dest = join(THEMES_DIR, path.slice(0, -5));
    extractAll(readFileSync(themeFilePath), dest);
    rmSync(themeFilePath);
    path = path.slice(0, -5);
  }

  const themePath = join(THEMES_DIR, path);
  const manifestPath = join(themePath, "manifest.json");
  if (!manifestPath.startsWith(`${THEMES_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid theme name");
  }

  const manifest: ThemeManifest = JSON.parse(
    readFileSync(manifestPath, {
      encoding: "utf-8",
    }),
  );

  return {
    path,
    manifest: theme.parse(manifest),
  };
}

ipcMain.on(RepluggedIpcChannels.GET_THEME, (event, path: string) => {
  try {
    event.returnValue = getTheme(path);
  } catch {}
});

ipcMain.on(RepluggedIpcChannels.LIST_THEMES, (event) => {
  const themes = [];

  const themeDirs = readdirSync(THEMES_DIR, {
    withFileTypes: true,
  })
    .map((f) => {
      if (isFileATheme(f, f.name)) return f;
      if (f.isSymbolicLink()) {
        try {
          const actualPath = readlinkSync(join(THEMES_DIR, f.name));
          const actualFile = statSync(actualPath);

          if (isFileATheme(actualFile, actualPath)) return f;
        } catch {}
      }

      return void 0;
    })
    .filter(Boolean) as Dirent[];

  for (const themeDir of themeDirs) {
    try {
      themes.push(getTheme(themeDir.name));
    } catch (e) {
      console.error(e);
    }
  }

  event.returnValue = themes;
});

ipcMain.handle(RepluggedIpcChannels.UNINSTALL_THEME, async (_, themeName: string) => {
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

ipcMain.on(RepluggedIpcChannels.OPEN_THEMES_FOLDER, () => shell.openPath(THEMES_DIR));
