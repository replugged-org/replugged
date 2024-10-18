/*
IPC events:
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/
import { type Dirent, type Stats, rmdirSync, unlinkSync } from "fs";
import { readFile, readdir, readlink, stat } from "fs/promises";
import { extname, join, sep } from "path";
import { ipcMain, shell } from "electron";
import { RepluggedIpcChannels, type RepluggedTheme } from "../../types";
import { theme } from "../../types/addon";
import { CONFIG_PATHS, extractAddon } from "src/util.mjs";

const THEMES_DIR = CONFIG_PATHS.themes;
const TEMP_THEMES_DIR = CONFIG_PATHS.temp_themes;

export const isFileATheme = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

async function getTheme(path: string): Promise<RepluggedTheme> {
  const isAsar = path.includes(".asar");
  const themePath = join(THEMES_DIR, path);
  const realThemePath = isAsar ? join(TEMP_THEMES_DIR, path.replace(/\.asar$/, "")) : themePath; // Remove ".asar" from the directory name
  if (isAsar) await extractAddon(themePath, realThemePath);

  const manifestPath = join(realThemePath, "manifest.json");

  if (!manifestPath.startsWith(`${realThemePath}${sep}`)) {
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
  RepluggedIpcChannels.GET_THEME,
  async (_, path: string): Promise<RepluggedTheme | undefined> => {
    try {
      return await getTheme(path);
    } catch {}
  },
);

ipcMain.handle(RepluggedIpcChannels.LIST_THEMES, async (): Promise<RepluggedTheme[]> => {
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

ipcMain.handle(RepluggedIpcChannels.UNINSTALL_THEME, (_, themeName: string) => {
  const isAsar = themeName.includes(".asar");
  const themePath = join(THEMES_DIR, themeName);
  const realThemePath = isAsar
    ? join(TEMP_THEMES_DIR, themeName.replace(/\.asar$/, ""))
    : themePath; // Remove ".asar" from the directory name

  if (!realThemePath.startsWith(`${isAsar ? TEMP_THEMES_DIR : THEMES_DIR}${sep}`)) {
    throw new Error("Invalid theme name");
  }
  if (isAsar) {
    unlinkSync(themePath);
    rmdirSync(realThemePath, { recursive: true });
  } else rmdirSync(themePath, { recursive: true });
});

ipcMain.on(RepluggedIpcChannels.OPEN_THEMES_FOLDER, () => shell.openPath(THEMES_DIR));

ipcMain.on(RepluggedIpcChannels.CLEAR_TEMP_THEME, () => {
  try {
    rmdirSync(TEMP_THEMES_DIR, { recursive: true });
  } catch {}
});
