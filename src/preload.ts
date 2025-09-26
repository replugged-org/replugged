import { contextBridge, ipcRenderer, webFrame } from "electron";

import { RepluggedIpcChannels } from "./types";
// eslint-disable-next-line no-duplicate-imports -- these are only used for types, the other import is for the actual code
import type {
  BackgroundMaterialType,
  CheckResultFailure,
  CheckResultSuccess,
  InstallResultFailure,
  InstallResultSuccess,
  InstallerType,
  RepluggedPlugin,
  RepluggedTheme,
  VibrancyType,
} from "./types";

const version = ipcRenderer.sendSync(RepluggedIpcChannels.GET_REPLUGGED_VERSION);

const RepluggedNative = {
  themes: {
    list: async (): Promise<RepluggedTheme[]> =>
      ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeName), // whether theme was successfully uninstalled
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_THEMES_FOLDER),
  },

  plugins: {
    get: (pluginPath: string): RepluggedPlugin | undefined =>
      ipcRenderer.sendSync(RepluggedIpcChannels.GET_PLUGIN, pluginPath),
    getPlaintextPatches: (pluginName: string): string =>
      ipcRenderer.sendSync(RepluggedIpcChannels.GET_PLUGIN_PLAINTEXT_PATCHES, pluginName),
    list: (): RepluggedPlugin[] => ipcRenderer.sendSync(RepluggedIpcChannels.LIST_PLUGINS),
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
      version: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.INSTALL_ADDON, type, path, url, true, version),
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
      version: string,
    ): Promise<InstallResultSuccess | InstallResultFailure> =>
      ipcRenderer.invoke(RepluggedIpcChannels.INSTALL_ADDON, type, path, url, false, version),
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(RepluggedIpcChannels.GET_QUICK_CSS),
    save: (css: string) => ipcRenderer.send(RepluggedIpcChannels.SAVE_QUICK_CSS, css),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_QUICKCSS_FOLDER),
  },

  settings: {
    get: (namespace: string, key: string) =>
      ipcRenderer.sendSync(RepluggedIpcChannels.GET_SETTING, namespace, key),
    set: (namespace: string, key: string, value: unknown) =>
      ipcRenderer.sendSync(RepluggedIpcChannels.SET_SETTING, namespace, key, value),
    has: (namespace: string, key: string) =>
      ipcRenderer.sendSync(RepluggedIpcChannels.HAS_SETTING, namespace, key),
    delete: (namespace: string, key: string) =>
      ipcRenderer.sendSync(RepluggedIpcChannels.DELETE_SETTING, namespace, key),
    all: (namespace: string) =>
      ipcRenderer.sendSync(RepluggedIpcChannels.GET_ALL_SETTINGS, namespace),
    openFolder: () => ipcRenderer.send(RepluggedIpcChannels.OPEN_SETTINGS_FOLDER),
  },

  reactDevTools: {
    downloadExtension: (): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.DOWNLOAD_REACT_DEVTOOLS),
    removeExtension: (): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.REMOVE_REACT_DEVTOOLS),
  },

  transparency: {
    getBackgroundMaterial: (): Promise<BackgroundMaterialType> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_BACKGROUND_MATERIAL),
    setBackgroundMaterial: (effect: BackgroundMaterialType): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.SET_BACKGROUND_MATERIAL, effect),
    getBackgroundColor: (): Promise<string> =>
      ipcRenderer.invoke(RepluggedIpcChannels.GET_BACKGROUND_COLOR),
    setBackgroundColor: (color: string): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.SET_BACKGROUND_COLOR, color),
    getVibrancy: (): Promise<VibrancyType> => ipcRenderer.invoke(RepluggedIpcChannels.GET_VIBRANCY),
    setVibrancy: (vibrancy: VibrancyType): Promise<void> =>
      ipcRenderer.invoke(RepluggedIpcChannels.SET_VIBRANCY, vibrancy),
    // visualEffectState does not need to be implemented until https://github.com/electron/electron/issues/25513 is implemented.
  },

  getVersion: (): string => version,

  // @todo We probably want to move these somewhere else, but I'm putting them here for now because I'm too lazy to set anything else up
};

export type RepluggedNativeType = typeof RepluggedNative;

contextBridge.exposeInMainWorld("RepluggedNative", RepluggedNative);

const renderer: string = ipcRenderer.sendSync(RepluggedIpcChannels.GET_REPLUGGED_RENDERER);

// webFrame.executeJavaScript returns a Promise, but we don't have any use for it
void webFrame.executeJavaScript(renderer);

try {
  // Get and execute Discord preload
  // If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
  const preload: string = ipcRenderer.sendSync(RepluggedIpcChannels.GET_DISCORD_PRELOAD);
  if (preload) require(preload);
} catch (err) {
  console.error("Error loading original preload", err);
}
