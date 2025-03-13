/*
IPC events:
- REPLUGGED_LIST_PLUGINS: returns an array of the names of all installed plugins
- REPLUGGED_UNINSTALL_PLUGIN: returns whether a plugin by the provided name was successfully uninstalled
*/

import { readFile, readdir, readlink, stat } from "fs/promises";
import { extname, join, sep } from "path";
import { ipcMain, shell } from "electron";
import { RepluggedIpcChannels, type RepluggedPlugin } from "../../types";
import { plugin } from "../../types/addon";
import { type Dirent, type Stats, rmdirSync, unlinkSync } from "fs";
import { CONFIG_PATHS, extractAddon } from "src/util.mjs";

const PLUGINS_DIR = CONFIG_PATHS.plugins;
const TEMP_PLUGINS_DIR = CONFIG_PATHS.temp_plugins;

export const isFileAPlugin = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

async function getPlugin(pluginName: string): Promise<RepluggedPlugin> {
  const isAsar = pluginName.includes(".asar");
  const pluginPath = join(PLUGINS_DIR, pluginName);
  const realPluginPath = isAsar
    ? join(TEMP_PLUGINS_DIR, pluginName.replace(/\.asar$/, ""))
    : pluginPath; // Remove ".asar" from the directory name
  if (isAsar) await extractAddon(pluginPath, realPluginPath);

  const manifestPath = join(realPluginPath, "manifest.json");
  if (!manifestPath.startsWith(`${realPluginPath}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid plugin name");
  }

  const manifest: unknown = JSON.parse(
    await readFile(manifestPath, {
      encoding: "utf-8",
    }),
  );

  const data = {
    path: pluginName,
    manifest: plugin.parse(manifest),
    hasCSS: false,
  };

  const cssPath = data.manifest.renderer?.replace(/\.js$/, ".css");
  const hasCSS =
    cssPath &&
    (await stat(join(realPluginPath, cssPath))
      .then(() => true)
      .catch(() => false));

  if (hasCSS) data.hasCSS = true;

  return data;
}

ipcMain.handle(
  RepluggedIpcChannels.GET_PLUGIN,
  async (_, pluginName: string): Promise<RepluggedPlugin | undefined> => {
    try {
      return await getPlugin(pluginName);
    } catch {}
  },
);

ipcMain.handle(RepluggedIpcChannels.LIST_PLUGINS, async (): Promise<RepluggedPlugin[]> => {
  const plugins = [];

  const pluginDirs = (
    await Promise.all(
      (
        await readdir(PLUGINS_DIR, {
          withFileTypes: true,
        })
      ).map(async (f) => {
        if (isFileAPlugin(f, f.name)) return f;
        if (f.isSymbolicLink()) {
          const actualPath = await readlink(join(PLUGINS_DIR, f.name));
          const actualFile = await stat(actualPath);
          if (isFileAPlugin(actualFile, actualPath)) return f;
        }
      }),
    )
  ).filter(Boolean) as Dirent[];

  for (const pluginDir of pluginDirs) {
    try {
      plugins.push(await getPlugin(pluginDir.name));
    } catch (e) {
      console.error(`Invalid plugin: ${pluginDir.name}`);
      console.error(e);
    }
  }

  return plugins;
});

ipcMain.handle(RepluggedIpcChannels.UNINSTALL_PLUGIN, (_, pluginName: string) => {
  const isAsar = pluginName.includes(".asar");
  const pluginPath = join(PLUGINS_DIR, pluginName);
  const realPluginPath = isAsar
    ? join(TEMP_PLUGINS_DIR, pluginName.replace(".asar", ""))
    : pluginPath; // Remove ".asar" from the directory name

  if (!realPluginPath.startsWith(`${isAsar ? TEMP_PLUGINS_DIR : PLUGINS_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid plugin name");
  }

  if (isAsar) {
    unlinkSync(pluginPath);
    rmdirSync(realPluginPath, { recursive: true });
  } else rmdirSync(pluginPath, { recursive: true });
});

ipcMain.on(RepluggedIpcChannels.OPEN_PLUGINS_FOLDER, () => shell.openPath(PLUGINS_DIR));

ipcMain.on(RepluggedIpcChannels.CLEAR_TEMP_THEME, () => {
  try {
    rmdirSync(TEMP_PLUGINS_DIR, { recursive: true });
  } catch {}
});
