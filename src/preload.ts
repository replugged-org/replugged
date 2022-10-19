import { contextBridge, ipcRenderer, webFrame } from 'electron';
import electron from 'electron';

import { RepluggedIpcChannels, RepluggedPlugin, RepluggedTheme } from './types';
import { Settings } from './types/settings';

const RepluggedNative = {
  themes: {
    enable: async (themeName: string) => {
      const { settings } = RepluggedNative;
      settings.set('themes', 'disabled', (await settings.get('themes', 'disabled') as string[]).filter(t => t !== themeName));
    },
    disable: async (themeName: string) => {
      const disabled = await RepluggedNative.settings.get('themes', 'disabled') as string[];
      if (!disabled.includes(themeName)) {
        disabled.push(themeName);
        RepluggedNative.settings.set('themes', 'disabled', disabled);
      }
    },
    list: async (): Promise<RepluggedTheme[]> => ipcRenderer.invoke(RepluggedIpcChannels.LIST_THEMES),
    listEnabled: async (): Promise<string[]> => {
      const disabled = await RepluggedNative.themes.listDisabled();
      const enabled: string[] = [];
      for (const theme of await RepluggedNative.themes.list()) {
        if (!disabled.includes(theme.id)) {
          enabled.push(theme.id);
        }
      }
      return enabled;
    },
    listDisabled: async (): Promise<string[]> => (await RepluggedNative.settings.get('themes', 'disabled')) ?? [],
    uninstall: async (themeName: string) =>
      ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_THEME, themeName) // whether theme was successfully uninstalled
  },

  plugins: {
    list: async (): Promise<RepluggedPlugin[]> => ipcRenderer.invoke(RepluggedIpcChannels.LIST_PLUGINS),
    uninstall: async (pluginName: string): Promise<RepluggedPlugin> => ipcRenderer.invoke(RepluggedIpcChannels.UNINSTALL_PLUGIN, pluginName)
  },

  quickCSS: {
    get: async () => ipcRenderer.invoke(RepluggedIpcChannels.GET_QUICK_CSS),
    save: (css: string) => ipcRenderer.send(RepluggedIpcChannels.SAVE_QUICK_CSS, css)
  },

  settings: {
    get: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_SETTING, namespace, key),
    set: (namespace: string, key: string, value: unknown) => ipcRenderer.invoke(RepluggedIpcChannels.SET_SETTING, namespace, key, value), // invoke or send?
    has: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.HAS_SETTING, namespace, key),
    delete: (namespace: string, key: string) => ipcRenderer.invoke(RepluggedIpcChannels.DELETE_SETTING, namespace, key),
    all: (namespace: string) => ipcRenderer.invoke(RepluggedIpcChannels.GET_ALL_SETTINGS, namespace),
    startTransaction: (namespace: string) => ipcRenderer.invoke(RepluggedIpcChannels.START_SETTINGS_TRANSACTION, namespace),
    endTransaction: (namespace: string, settings: Settings | null) => ipcRenderer.invoke(RepluggedIpcChannels.END_SETTINGS_TRANSACTION, namespace, settings)
  },

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
