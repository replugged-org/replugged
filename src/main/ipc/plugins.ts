/*
IPC events:
- REPLUGGED_LIST_PLUGINS: returns an array of the names of all installed plugins
- REPLUGGED_UNINSTALL_PLUGIN: returns whether a plugin by the provided name was successfully uninstalled
*/

import { readFile, readdir, readlink, rm, stat } from "fs/promises";
import { extname, join, sep } from "path";
import { ipcMain, shell } from "electron";
import { RepluggedIpcChannels, type RepluggedPlugin } from "../../types";
import { plugin } from "../../types/addon";
import { type Dirent, type Stats } from "fs";
import { CONFIG_PATHS } from "src/util.mjs";
import { getSetting } from "./settings";
const PLUGINS_DIR = CONFIG_PATHS.plugins;

export const isFileAPlugin = (f: Dirent | Stats, name: string): boolean => {
  return f.isDirectory() || (f.isFile() && extname(name) === ".asar");
};

async function getPlugin(pluginName: string): Promise<RepluggedPlugin> {
  const manifestPath = join(PLUGINS_DIR, pluginName, "manifest.json");
  if (!manifestPath.startsWith(`${PLUGINS_DIR}${sep}`)) {
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
    (await stat(join(PLUGINS_DIR, pluginName, cssPath))
      .then(() => true)
      .catch(() => false));

  if (hasCSS) data.hasCSS = true;

  return data;
}

async function listPlugins(): Promise<RepluggedPlugin[]> {
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
  return await listPlugins();
});

ipcMain.handle(
  RepluggedIpcChannels.LIST_PLUGINS_NATIVE,
  async (): Promise<Record<string, Record<string, string>>> => {
    const disabled = await getSetting<string[]>("plugins", "disabled", []);
    const plugins = await listPlugins();

    return plugins.reduce((acc: Record<string, Record<string, string>>, plugin) => {
      try {
        if (!plugin.manifest.native || disabled.includes(plugin.manifest.id)) return acc;
        const nativePath = join(PLUGINS_DIR, plugin.path, plugin.manifest.native);
        if (!nativePath.startsWith(`${PLUGINS_DIR}${sep}`)) {
          // Ensure file changes are restricted to the base path
          throw new Error("Invalid plugin name");
        }

        const entries = Object.entries<(...args: unknown[]) => unknown>(require(nativePath));
        if (!entries.length) return acc;

        const mappings: Record<string, string> = {};

        for (const [methodName, method] of entries) {
          const key = `Replugged_Plugin_Native_[${plugin.manifest.id}]_${methodName}`;
          ipcMain.handle(key, (_, ...args) => method(...args) /* For easy type when importing */);
          mappings[methodName] = key;
        }
        acc[plugin.manifest.id] = mappings;
        return acc;
      } catch (e) {
        console.error(`Error Loading Plugin Native`, plugin.manifest);
        console.error(e);
        return acc;
      }
    }, {});
  },
);

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
