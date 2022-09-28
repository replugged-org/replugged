import { contextBridge, ipcRenderer, webFrame } from "electron";

const themesMap = new Map();
let quickCSSKey: string;

const RepluggedNative = {
  themes: {
    enable: async (themeName: string) => {},
    disable: async (themeName: string) => {},
    load: async (themeName: string) => {
      return ipcRenderer
        .invoke("REPLUGGED_GET_THEME_CSS", themeName)
        .then((css) => {
          const cssKey = webFrame.insertCSS(css);
          themesMap.set(themeName, cssKey);
        });
    },
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
    list: async () => {
      return ipcRenderer.invoke("REPLUGGED_LIST_THEMES");
    },
    listEnabled: async () => {},
    listDisabled: async () => {},
    uninstall: async (themeName: string) => {
      return ipcRenderer.invoke("REPLUGGED_UNINSTALL_THEME", themeName); // whether theme was successfully uninstalled
    },
  },

  plugins: {
    getJS: async (pluginName: string) => {
      return ipcRenderer.invoke("REPLUGGED_GET_PLUGIN_JS", pluginName);
    },
    list: async () => {
      return ipcRenderer.invoke("REPLUGGED_LIST_PLUGINS");
    },
    uninstall: async (pluginName: string) => {
      return ipcRenderer.invoke("REPLUGGED_UNINSTALL_PLUGIN", pluginName);
    },
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke("REPLUGGED_GET_QUICK_CSS"),
    load: async () =>
      RepluggedNative.quickCSS.get().then((css) => {
        quickCSSKey = webFrame.insertCSS(css);
      }),
    unload: () => webFrame.removeInsertedCSS(quickCSSKey),
    save: (css: string) => ipcRenderer.send("REPLUGGED_SAVE_QUICK_CSS", css),
    reload: async () => {
      RepluggedNative.quickCSS.unload();
      return RepluggedNative.quickCSS.load();
    },
  },

  settings: {
    get: (key: string) => {},
    set: (key: string, value: any) => {},
    has: (key: string) => {},
    delete: (key: string) => {},
  },

  openDevTools: () => {}, // TODO
  closeDevTools: () => {}, // TODO

  clearCache: () => {}, // maybe?
  openBrowserWindow: (opts: Electron.BrowserWindowConstructorOptions) => {}, // later
};

contextBridge.exposeInMainWorld("RepluggedNative", RepluggedNative);

// Get and execute Discord preload
// If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
const preload = ipcRenderer.sendSync("REPLUGGED_GET_DISCORD_PRELOAD");
if (preload) {
  require(preload);
}
// somewhere: load renderer code

// While we could keep the thing below...it's terrible practice to use time delay
// as a substitute for handling events.
//setTimeout(() => DiscordNative.window.setDevtoolsCallbacks(null, null), 5e3);
