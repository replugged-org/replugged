/*
IPC events:
- REPLUGGED_LIST_PLUGINS: returns an array of the names of all installed plugins
- REPLUGGED_UNINSTALL_PLUGIN: returns whether a plugin by the provided name was successfully uninstalled
*/

import { ipcMain, shell } from "electron";
import { type Dirent, type Stats, readFileSync, readdirSync, readlinkSync, statSync } from "fs";
import { rm } from "fs/promises";
import { extname, join, sep } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { RepluggedIpcChannels, type RepluggedPlugin } from "../../types";
import { plugin } from "../../types/addon";

const PLUGINS_DIR = CONFIG_PATHS.plugins;

export const isFileAPlugin = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

function getPlugin(pluginName: string): RepluggedPlugin {
  const manifestPath = join(PLUGINS_DIR, pluginName, "manifest.json");
  if (!manifestPath.startsWith(`${PLUGINS_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid plugin name");
  }

  const manifest: unknown = JSON.parse(
    readFileSync(manifestPath, {
      encoding: "utf-8",
    }),
  );

  const data = {
    path: pluginName,
    manifest: plugin.parse(manifest),
    hasCSS: false,
  };

  const cssPath = data.manifest.renderer?.replace(/\.js$/, ".css");
  let hasCSS = false;

  if (cssPath) {
    try {
      statSync(join(PLUGINS_DIR, pluginName, cssPath));
      hasCSS = true;
    } catch {
      hasCSS = false;
    }
  }

  if (hasCSS) data.hasCSS = true;

  return data;
}

ipcMain.on(RepluggedIpcChannels.GET_PLUGIN, (event, pluginName: string) => {
  try {
    event.returnValue = getPlugin(pluginName);
  } catch {}
});

ipcMain.on(RepluggedIpcChannels.LIST_PLUGINS, (event) => {
  const plugins = [];

  const pluginDirs = readdirSync(PLUGINS_DIR, {
    withFileTypes: true,
  })
    .map((f) => {
      if (isFileAPlugin(f, f.name)) return f;
      if (f.isSymbolicLink()) {
        try {
          const actualPath = readlinkSync(join(PLUGINS_DIR, f.name));
          const actualFile = statSync(actualPath);

          if (isFileAPlugin(actualFile, actualPath)) return f;
        } catch {}
      }

      return void 0;
    })
    .filter(Boolean) as Dirent[];

  for (const pluginDir of pluginDirs) {
    try {
      plugins.push(getPlugin(pluginDir.name));
    } catch (e) {
      console.error(`Invalid plugin: ${pluginDir.name}`);
      console.error(e);
    }
  }

  event.returnValue = plugins;
});

ipcMain.handle(RepluggedIpcChannels.UNINSTALL_PLUGIN, async (_, pluginName: string) => {
  const pluginPath = join(PLUGINS_DIR, pluginName);
  if (!pluginPath.startsWith(`${PLUGINS_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid plugin name");
  }

  await rm(pluginPath, {
    recursive: true,
    force: true,
  });
});

ipcMain.on(RepluggedIpcChannels.OPEN_PLUGINS_FOLDER, () => shell.openPath(PLUGINS_DIR));

ipcMain.on(RepluggedIpcChannels.GET_PLUGIN_PLAINTEXT_PATCHES, (event, pluginName: string) => {
  const plugin = getPlugin(pluginName);
  if (!plugin.manifest.plaintextPatches) return;

  const path = join(CONFIG_PATHS.plugins, pluginName, plugin.manifest.plaintextPatches);
  if (!path.startsWith(`${PLUGINS_DIR}${sep}`)) {
    // Ensure file changes are restricted to the base path
    throw new Error("Invalid plugin name");
  }

  event.returnValue = readFileSync(path, "utf-8");
});
