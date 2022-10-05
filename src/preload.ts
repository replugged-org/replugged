import { contextBridge, ipcRenderer, webFrame } from 'electron';
import electron from 'electron';

import { RepluggedIpcChannels } from './types';
import { Settings } from './types/settings';

const RepluggedNative = {
  themes: {
    enable: async (themeName: string) => {},
    disable: async (themeName: string) => {},
    list: async () => ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    isEnabled: async (themeName: string) => ipcRenderer.invoke(RepluggedIpcChannels.IS_THEME_ENABLED, themeName),
    listEnabled: async (): Promise<string[]> => {},
    listDisabled: async () => {},
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeName), // whether theme was successfully uninstalled
  },

  plugins: {
    getJS: async (pluginName: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_PLUGIN_JS, pluginName),
    list: async () => ipcRenderer.invoke(RepluggedIpcChannels.LIST_PLUGINS),
    uninstall: async (pluginName: string) => ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_PLUGIN, pluginName),
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(RepluggedIpcChannels.GET_QUICK_CSS),
    save: (css: string) => ipcRenderer.send(RepluggedIpcChannels.SAVE_QUICK_CSS, css),
  },

  settings: {
    get: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_SETTING, namespace, key),
    set: (namespace: string, key: string, value: unknown) => ipcRenderer.invoke(RepluggedIpcChannels.SET_SETTING, namespace, key, value), // invoke or send?
    has: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.HAS_SETTING, namespace, key),
    delete: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.DELETE_SETTING, namespace, key),
    all: (namespace: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_ALL_SETTINGS, namespace),
    startTransaction: (namespace: string) => ipcRenderer.invoke(RepluggedIpcChannels.START_SETTINGS_TRANSACTION, namespace),
    endTransaction: (namespace: string, settings: Settings | null) => ipcRenderer.invoke(RepluggedIpcChannels.END_SETTINGS_TRANSACTION, namespace, settings),
  },

  openDevTools: () => {}, // TODO
  closeDevTools: () => {}, // TODO

  clearCache: () => {}, // maybe?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  openBrowserWindow: (opts: electron.BrowserWindowConstructorOptions) => { }, // later

  // @todo We probably want to move these somewhere else, but I'm putting them here for now because I'm too lazy to set anything else up
};

export type RepluggedNativeType = typeof RepluggedNative;

contextBridge.exposeInMainWorld('RepluggedNative', RepluggedNative);

const renderer = ipcRenderer.sendSync(RepluggedIpcChannels.GET_RENDERER_JS);
webFrame.executeJavaScript(renderer);

// Get and execute Discord preload
// If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
const preload = ipcRenderer.sendSync(RepluggedIpcChannels.GET_DISCORD_PRELOAD);
if (preload) {
  require(preload);
}

// While we could keep the thing below...it's terrible practice to use time delay
// as a substitute for handling events.
// setTimeout(() => DiscordNative.window.setDevtoolsCallbacks(null, null), 5e3);
