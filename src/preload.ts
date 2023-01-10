import {
  type BrowserWindowConstructorOptions,
  contextBridge,
  ipcRenderer,
  webFrame,
} from "electron";

import { RepluggedIpcChannels } from "./types";
import type {
  RepluggedPlugin,
  RepluggedTheme,
  UpdateCheckResultFailure,
  UpdateCheckResultSuccess,
  UpdateInstallResultFailure,
  UpdateInstallResultSuccess,
  UpdaterType,
} from "./types";

const RepluggedNative = {
  themes: {
    enable: async (themeID: string) => {
      const { settings } = RepluggedNative;
      await settings.set(
        "themes",
        "disabled",
        (((await settings.get("themes", "disabled")) as string[]) || []).filter(
          (t) => t !== themeID,
        ),
      );
    },
    disable: async (themeID: string) => {
      const disabled: string[] = (await RepluggedNative.settings.get("themes", "disabled")) || [];
      if (!disabled.includes(themeID)) {
        disabled.push(themeID);
        await RepluggedNative.settings.set("themes", "disabled", disabled);
      }
    },
    list: async (): Promise<RepluggedTheme[]> =>
      ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    listEnabled: async (): Promise<string[]> => {
      const disabled = await RepluggedNative.themes.listDisabled();
      const enabled: string[] = [];
      for (const theme of await RepluggedNative.themes.list()) {
        if (!disabled.includes(theme.manifest.id)) {
          enabled.push(theme.manifest.id);
        }
      }
      return enabled;
    },
    listDisabled: async (): Promise<string[]> =>
      (await RepluggedNative.settings.get("themes", "disabled")) ?? [],
    uninstall: async (themeID: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeID), // whether theme was successfully uninstalled
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_THEMES_FOLDER),
  },

  plugins: {
    enable: async (pluginID: string) => {
      const { settings } = RepluggedNative;
      await settings.set(
        "plugins",
        "disabled",
        (((await settings.get("plugins", "disabled")) as string[]) || []).filter(
          (t) => t !== pluginID,
        ),
      );
    },
    disable: async (pluginID: string) => {
      const disabled: string[] = (await RepluggedNative.settings.get("plugins", "disabled")) || [];
      if (!disabled.includes(pluginID)) {
        disabled.push(pluginID);
        await RepluggedNative.settings.set("plugins", "disabled", disabled);
      }
    },
    get: async (pluginID: string): Promise<RepluggedPlugin | undefined> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_PLUGIN, pluginID),
    list: async (): Promise<RepluggedPlugin[]> =>
      ipcRenderer.invoke(RepluggedIpcChannels.LIST_PLUGINS),
    listEnabled: async (): Promise<string[]> => {
      const disabled = await RepluggedNative.plugins.listDisabled();
      const enabled: string[] = [];
      for (const plugin of await RepluggedNative.plugins.list()) {
        if (!disabled.includes(plugin.manifest.id)) {
          enabled.push(plugin.manifest.id);
        }
      }
      return enabled;
    },
    listDisabled: async (): Promise<string[]> =>
      (await RepluggedNative.settings.get("plugins", "disabled")) ?? [],
    uninstall: async (pluginID: string): Promise<RepluggedPlugin> =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_PLUGIN, pluginID),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_PLUGINS_FOLDER),
  },

  updater: {
    getHash: async (type: UpdaterType, path: string): Promise<string> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_HASH, type, path),
    check: async (
      type: string,
      repo: string,
      id: string,
    ): Promise<UpdateCheckResultSuccess | UpdateCheckResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.CHECK_UPDATE, type, repo, id),
    install: async (
      type: UpdaterType,
      path: string,
      url: string,
    ): Promise<UpdateInstallResultSuccess | UpdateInstallResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.INSTALL_UPDATE, type, path, url),
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(RepluggedIpcChannels.GET_QUICK_CSS),
    save: (css: string) => ipcRenderer.send(RepluggedIpcChannels.SAVE_QUICK_CSS, css),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_QUICKCSS_FOLDER),
  },

  settings: {
    get: (namespace: string, key: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_SETTING, namespace, key),
    set: (namespace: string, key: string, value: unknown) =>
      ipcRenderer.invoke(RepluggedIpcChannels.SET_SETTING, namespace, key, value), // invoke or send?
    has: (namespace: string, key: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.HAS_SETTING, namespace, key),
    delete: (namespace: string, key: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.DELETE_SETTING, namespace, key),
    all: (namespace: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_ALL_SETTINGS, namespace),
    startTransaction: (namespace: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.START_SETTINGS_TRANSACTION, namespace),
    endTransaction: (namespace: string, settings: Record<string, unknown> | null) =>
      ipcRenderer.invoke(RepluggedIpcChannels.END_SETTINGS_TRANSACTION, namespace, settings),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_SETTINGS_FOLDER),
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openBrowserWindow: (opts: BrowserWindowConstructorOptions) => {}, // later

  // @todo We probably want to move these somewhere else, but I'm putting them here for now because I'm too lazy to set anything else up
};

export type RepluggedNativeType = typeof RepluggedNative;

contextBridge.exposeInMainWorld("RepluggedNative", RepluggedNative);

// webFrame.executeJavaScript returns a Promise, but we don't have any use for it
void webFrame.executeJavaScript('void import("replugged://renderer");');

try {
  window.addEventListener("beforeunload", () => {
    ipcRenderer.send(RepluggedIpcChannels.REGISTER_RELOAD);
  });
  // Get and execute Discord preload
  // If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
  const preload = ipcRenderer.sendSync(RepluggedIpcChannels.GET_DISCORD_PRELOAD);
  if (preload) require(preload);
} catch (err) {
  console.error("Error loading original preload", err);
}
