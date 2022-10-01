import { contextBridge, ipcRenderer, webFrame } from 'electron';
import electron from 'electron';

import { RepluggedIpcChannels } from './types';

const themesMap = new Map();
let quickCSSKey: string;

const RepluggedNative = {
  themes: {
    enable: async (themeName: string) => {},
    disable: async (themeName: string) => {},
    load: async (themeName: string) => ipcRenderer
      .invoke(RepluggedIpcChannels.GET_THEME_CSS, themeName)
      .then((css) => {
        const cssKey = webFrame.insertCSS(css);
        themesMap.set(themeName, cssKey);
      }),
    loadAll: async () => {},
    unload: (themeName: string) => {
      webFrame.removeInsertedCSS(themesMap.get(themeName));
      themesMap.delete(themeName);
    },
    unloadAll: () => {
      for (const theme of themesMap.keys()) {
        RepluggedNative.themes.unload(theme);
      }
    },
    reload: async (themeName: string) => {
      RepluggedNative.themes.unload(themeName);
      await RepluggedNative.themes.load(themeName);
    },
    reloadAll: async () => {},
    list: async () => ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    listEnabled: async () => {},
    listDisabled: async () => {},
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeName) // whether theme was successfully uninstalled

  },

  plugins: {
    getJS: async (pluginName: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_PLUGIN_JS, pluginName),
    list: async () => ipcRenderer.invoke(RepluggedIpcChannels.LIST_PLUGINS),
    uninstall: async (pluginName: string) => ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_PLUGIN, pluginName)
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(RepluggedIpcChannels.GET_QUICK_CSS),
    load: async () =>
      RepluggedNative.quickCSS.get().then((css) => {
        quickCSSKey = webFrame.insertCSS(css);
      }),
    unload: () => webFrame.removeInsertedCSS(quickCSSKey),
    save: (css: string) => ipcRenderer.send(RepluggedIpcChannels.SAVE_QUICK_CSS, css),
    reload: async () => {
      RepluggedNative.quickCSS.unload();
      return RepluggedNative.quickCSS.load();
    }
  },

  settings: {
    get: (key: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_SETTING, key),
    set: (key: string, value: any) => ipcRenderer.send(RepluggedIpcChannels.SET_SETTING, key, value), // invoke or send?
    has: (key: string) => ipcRenderer.invoke(RepluggedIpcChannels.HAS_SETTING, key),
    delete: (key: string) => ipcRenderer.send(RepluggedIpcChannels.DELETE_SETTING, key)
  },

  openDevTools: () => {}, // TODO
  closeDevTools: () => {}, // TODO

  clearCache: () => {}, // maybe?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  openBrowserWindow: (opts: electron.BrowserWindowConstructorOptions) => { } // later

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
