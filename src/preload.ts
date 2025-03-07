import {
  type BrowserWindowConstructorOptions,
  contextBridge,
  ipcRenderer,
  webFrame,
} from "electron";

import { ReCelledIpcChannels } from "./types";
// eslint-disable-next-line no-duplicate-imports -- these are only used for types, the other import is for the actual code
import type {
  CheckResultFailure,
  CheckResultSuccess,
  InstallResultFailure,
  InstallResultSuccess,
  InstallerType,
  ReCelledPlugin,
  ReCelledTheme,
} from "./types";

let version = "";
void ipcRenderer.invoke(ReCelledIpcChannels.GET_RECELLED_VERSION).then((v) => {
  version = v;
});

const ReCelledNative = {
  themes: {
    list: async (): Promise<ReCelledTheme[]> => ipcRenderer.invoke(ReCelledIpcChannels.LIST_THEMES),
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(ReCelledIpcChannels.UNINSTALL_THEME, themeName), // whether theme was successfully uninstalled
    openFolder: () => ipcRenderer.send(ReCelledIpcChannels.OPEN_THEMES_FOLDER),
  },

  plugins: {
    get: (pluginPath: string): ReCelledPlugin | undefined =>
      ipcRenderer.sendSync(ReCelledIpcChannels.GET_PLUGIN, pluginPath),
    list: (): ReCelledPlugin[] => ipcRenderer.sendSync(ReCelledIpcChannels.LIST_PLUGINS),
    readPlaintextPatch: (pluginPath: string): string | undefined =>
      ipcRenderer.sendSync(ReCelledIpcChannels.READ_PLUGIN_PLAINTEXT_PATCHES, pluginPath),
    uninstall: async (pluginPath: string): Promise<ReCelledPlugin> =>
      ipcRenderer.invoke(ReCelledIpcChannels.UNINSTALL_PLUGIN, pluginPath),
    openFolder: () => ipcRenderer.send(ReCelledIpcChannels.OPEN_PLUGINS_FOLDER),
  },

  updater: {
    check: async (
      type: string,
      identifier: string,
      id: string,
    ): Promise<CheckResultSuccess | CheckResultFailure> =>
      ipcRenderer.invoke(ReCelledIpcChannels.GET_ADDON_INFO, type, identifier, id),
    install: async (
      type: InstallerType | "recelled",
      path: string,
      url: string,
      version: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(ReCelledIpcChannels.INSTALL_ADDON, type, path, url, true, version),
  },

  installer: {
    getInfo: async (
      type: string,
      repo: string,
      id?: string,
    ): Promise<CheckResultSuccess | CheckResultFailure> =>
      ipcRenderer.invoke(ReCelledIpcChannels.GET_ADDON_INFO, type, repo, id),
    install: async (
      type: InstallerType,
      path: string,
      url: string,
      version: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(ReCelledIpcChannels.INSTALL_ADDON, type, path, url, false, version),
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(ReCelledIpcChannels.GET_QUICK_CSS),
    save: (css: string) => ipcRenderer.send(ReCelledIpcChannels.SAVE_QUICK_CSS, css),
    openFolder: () => ipcRenderer.send(ReCelledIpcChannels.OPEN_QUICKCSS_FOLDER),
  },

  settings: {
    get: (namespace: string, key: string) =>
      ipcRenderer.sendSync(ReCelledIpcChannels.GET_SETTING, namespace, key),
    set: (namespace: string, key: string, value: unknown) =>
      ipcRenderer.sendSync(ReCelledIpcChannels.SET_SETTING, namespace, key, value), // invoke or send?
    has: (namespace: string, key: string) =>
      ipcRenderer.sendSync(ReCelledIpcChannels.HAS_SETTING, namespace, key),
    delete: (namespace: string, key: string) =>
      ipcRenderer.sendSync(ReCelledIpcChannels.DELETE_SETTING, namespace, key),
    all: (namespace: string) =>
      ipcRenderer.sendSync(ReCelledIpcChannels.GET_ALL_SETTINGS, namespace),
    startTransaction: (namespace: string) =>
      ipcRenderer.invoke(ReCelledIpcChannels.START_SETTINGS_TRANSACTION, namespace),
    endTransaction: (namespace: string, settings: Record<string, unknown> | null) =>
      ipcRenderer.invoke(ReCelledIpcChannels.END_SETTINGS_TRANSACTION, namespace, settings),
    openFolder: () => ipcRenderer.send(ReCelledIpcChannels.OPEN_SETTINGS_FOLDER),
  },

  reactDevTools: {
    downloadExtension: (): Promise<void> =>
      ipcRenderer.invoke(ReCelledIpcChannels.DOWNLOAD_REACT_DEVTOOLS),
  },

  getVersion: () => version,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openBrowserWindow: (opts: BrowserWindowConstructorOptions) => {}, // later

  // @todo We probably want to move these somewhere else, but I'm putting them here for now because I'm too lazy to set anything else up
};

export type ReCelledNativeType = typeof ReCelledNative;

contextBridge.exposeInMainWorld("RepluggedNative", ReCelledNative);
contextBridge.exposeInMainWorld("ReCelledNative", ReCelledNative);

// webFrame.executeJavaScript returns a Promise, but we don't have any use for it
const renderer = ipcRenderer.sendSync(ReCelledIpcChannels.GET_RECELLED_RENDERER);

void webFrame.executeJavaScript(renderer);

try {
  window.addEventListener("beforeunload", () => {
    ipcRenderer.send(ReCelledIpcChannels.REGISTER_RELOAD);
  });
  // Get and execute Discord preload
  // If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
  const preload = ipcRenderer.sendSync(ReCelledIpcChannels.GET_DISCORD_PRELOAD);
  if (preload) require(preload);
} catch (err) {
  console.error("Error loading original preload", err);
}
