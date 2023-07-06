import {
  type BrowserWindowConstructorOptions,
  contextBridge,
  ipcRenderer,
  webFrame,
} from "electron";

import { RepluggedIpcChannels } from "./types";
import type {
  CheckResultFailure,
  CheckResultSuccess,
  InstallResultFailure,
  InstallResultSuccess,
  InstallerType,
  RepluggedPlugin,
  RepluggedTheme,
  RepluggedTranslations,
} from "./types";

let version = "";
void ipcRenderer.invoke(RepluggedIpcChannels.GET_REPLUGGED_VERSION).then((v) => {
  version = v;
});

const RepluggedNative = {
  themes: {
    list: async (): Promise<RepluggedTheme[]> =>
      ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeName), // whether theme was successfully uninstalled
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_THEMES_FOLDER),
  },

  plugins: {
    get: async (pluginPath: string): Promise<RepluggedPlugin | undefined> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_PLUGIN, pluginPath),
    list: async (): Promise<RepluggedPlugin[]> =>
      ipcRenderer.invoke(RepluggedIpcChannels.LIST_PLUGINS),
    uninstall: async (pluginPath: string): Promise<RepluggedPlugin> =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_PLUGIN, pluginPath),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_PLUGINS_FOLDER),
  },

  updater: {
    check: async (
      type: string,
      identifier: string,
      id: string,
    ): Promise<CheckResultSuccess | CheckResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_ADDON_INFO, type, identifier, id),
    install: async (
      type: InstallerType | "replugged",
      path: string,
      url: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.INSTALL_ADDON, type, path, url),
  },

  installer: {
    getInfo: async (
      type: string,
      repo: string,
      id?: string,
    ): Promise<CheckResultSuccess | CheckResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_ADDON_INFO, type, repo, id),
    install: async (
      type: InstallerType,
      path: string,
      url: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.INSTALL_ADDON, type, path, url),
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

  i18n: {
    getStrings: (): Promise<RepluggedTranslations> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_I18N_STRINGS),
  },

  reactDevTools: {
    downloadExtension: (): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.DOWNLOAD_REACT_DEVTOOLS),
  },

  getVersion: () => version,

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
