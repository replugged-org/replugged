const { contextBridge, ipcRenderer, webFrame } = require("electron");

const themesMap = new Map();
let quickCSSKey;

const RepluggedNative = {
  themes: {
    enable: async (themeName) => {},
    disable: async (themeName) => {},
    load: async (themeName) => {
      return ipcRenderer.invoke("REPLUGGED_GET_THEME_CSS", themeName).then(css => {
        const cssKey = webFrame.insertCSS(css);
        themesMap.set(themeName, cssKey);
      })
    },
    loadAll: async () => {},
    unload: (themeName) => {
      webFrame.removeInsertedCSS(themesMap.get(themeName));
      themesMap.delete(themeName);
    },
    unloadAll: () => {
      for (const theme of themesMap.keys()) {
        RepluggedNative.themes.unload(theme);
      }
    },
    reload: async (themeName) => {
      RepluggedNative.themes.unload(themeName);
      await RepluggedNative.themes.load(themeName);
    },
    reloadAll: async () => {},
    list: async () => {
      return ipcRenderer.invoke("REPLUGGED_LIST_THEMES");
    },
    listEnabled: async () => {},
    listDisabled: async () => {},
    uninstall: async (themeName) => {
      return ipcRenderer.invoke("REPLUGGED_UNINSTALL_THEME", themeName); // whether theme was successfully uninstalled
    }
  },

  plugins: {
    getJS: async (pluginName) => {
      return ipcRenderer.invoke("REPLUGGED_GET_PLUGIN_JS", pluginName);
    },
    list: async () => {
      return ipcRenderer.invoke("REPLUGGED_LIST_PLUGINS");
    },
    uninstall: async (pluginName) => {
      return ipcRenderer.invoke("REPLUGGED_UNINSTALL_PLUGIN", pluginName);
    }
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke("REPLUGGED_GET_QUICK_CSS"),
    load: async () => RepluggedNative.quickCSS.get().then(css => {
      quickCSSKey = webFrame.insertCSS(css);
    }),
    unload: () => webFrame.removeInsertedCSS(quickCSSKey),
    save: (css) => ipcRenderer.send("REPLUGGED_SAVE_QUICK_CSS", css),
    reload: async () => {
      RepluggedNative.quickCSS.unload();
      return RepluggedNative.quickCSS.load();
    }
  },

  settings: {
    get: (key) => {},
    set: (key, value) => {},
    has: (key) => {},
    delete: (key) => {}
  },

  openDevTools: () => {},     // TODO
  closeDevTools: () => {},    // TODO

  clearCache: () => {},       // maybe?
  openBrowserWindow: (opts) => {} // later
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