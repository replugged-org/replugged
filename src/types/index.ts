import type { WebContents } from "electron";
import type { PluginManifest, ThemeManifest } from "./addon";
import type { ConnectedAccount } from "./discord";

export type ReCelledWebContents = WebContents & {
  originalPreload?: string;
};

export enum ReCelledIpcChannels {
  GET_DISCORD_PRELOAD = "RECELLED_GET_DISCORD_PRELOAD",
  GET_RECELLED_RENDERER = "RECELLED_GET_RECELLED_RENDERER",
  GET_QUICK_CSS = "RECELLED_GET_QUICK_CSS",
  SAVE_QUICK_CSS = "RECELLED_SAVE_QUICK_CSS",
  GET_SETTING = "RECELLED_GET_SETTING",
  SET_SETTING = "RECELLED_SET_SETTING",
  HAS_SETTING = "RECELLED_HAS_SETTING",
  DELETE_SETTING = "RECELLED_DELETE_SETTING",
  GET_ALL_SETTINGS = "RECELLED_GET_ALL_SETTINGS",
  START_SETTINGS_TRANSACTION = "RECELLED_START_SETTINGS_TRANSACTION",
  END_SETTINGS_TRANSACTION = "RECELLED_END_SETTINGS_TRANSACTION",
  LIST_THEMES = "RECELLED_LIST_THEMES",
  GET_THEME = "RECELLED_GET_THEME",
  UNINSTALL_THEME = "RECELLED_UNINSTALL_THEME",
  LIST_PLUGINS = "RECELLED_LIST_PLUGINS",
  GET_PLUGIN = "RECELLED_GET_PLUGIN",
  READ_PLUGIN_PLAINTEXT_PATCHES = "RECELLED_READ_PLUGIN_PLAINTEXT_PATCHES",
  UNINSTALL_PLUGIN = "RECELLED_UNINSTALL_PLUGIN",
  REGISTER_RELOAD = "RECELLED_REGISTER_RELOAD",
  GET_ADDON_INFO = "RECELLED_GET_ADDON_INFO",
  INSTALL_ADDON = "RECELLED_INSTALL_ADDON",
  OPEN_PLUGINS_FOLDER = "RECELLED_OPEN_PLUGINS_FOLDER",
  OPEN_THEMES_FOLDER = "RECELLED_OPEN_THEMES_FOLDER",
  OPEN_SETTINGS_FOLDER = "RECELLED_OPEN_SETTINGS_FOLDER",
  OPEN_QUICKCSS_FOLDER = "RECELLED_OPEN_QUICKCSS_FOLDER",
  GET_RECELLED_VERSION = "RECELLED_GET_RECELLED_VERSION",
  DOWNLOAD_REACT_DEVTOOLS = "RECELLED_DOWNLOAD_REACT_DEVTOOLS",
}

export interface ReCelledAnnouncement {
  _dismissed?: boolean;
  message: React.ReactNode;
  color?: string;
  onClose?: () => void;
  button?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
}

export interface ReCelledConnection {
  type: string;
  name: string;
  color: string;
  enabled: boolean;
  icon: {
    darkSVG: string;
    lightSVG: string;
  };
  fetchAccount: (id: string) => Promise<ConnectedAccount>;
  getPlatformUserUrl?: (account: ConnectedAccount) => string;
  onDisconnect: () => void;
  onConnect: () => void;
  setVisibility: (visible: boolean) => boolean | void;
}

export interface ReCelledTheme {
  path: string;
  manifest: ThemeManifest;
}

export interface ReCelledPlugin {
  path: string;
  manifest: PluginManifest;
  hasCSS: boolean;
}

export type { AnyAddonManifest, PluginExports, PluginManifest, ThemeManifest } from "./addon";
export * from "./coremods/commands";
export * from "./coremods/contextMenu";
export * from "./coremods/message";
export * from "./coremods/settings";
export * from "./discord";
export * from "./installer";
export * from "./settings";
export * from "./util";
export * from "./webpack";
