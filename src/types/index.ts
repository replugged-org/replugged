import type { WebContents } from "electron";
import type { PluginManifest, ThemeManifest } from "./addon";

export type RepluggedWebContents = WebContents & {
  originalPreload?: string;
};

export enum RepluggedIpcChannels {
  GET_DISCORD_PRELOAD = "REPLUGGED_GET_DISCORD_PRELOAD",
  GET_REPLUGGED_RENDERER = "REPLUGGED_GET_REPLUGGED_RENDERER",
  GET_QUICK_CSS = "REPLUGGED_GET_QUICK_CSS",
  SAVE_QUICK_CSS = "REPLUGGED_SAVE_QUICK_CSS",
  GET_SETTING = "REPLUGGED_GET_SETTING",
  SET_SETTING = "REPLUGGED_SET_SETTING",
  HAS_SETTING = "REPLUGGED_HAS_SETTING",
  DELETE_SETTING = "REPLUGGED_DELETE_SETTING",
  GET_ALL_SETTINGS = "REPLUGGED_GET_ALL_SETTINGS",
  LIST_THEMES = "REPLUGGED_LIST_THEMES",
  GET_THEME = "REPLUGGED_GET_THEME",
  UNINSTALL_THEME = "REPLUGGED_UNINSTALL_THEME",
  LIST_PLUGINS = "REPLUGGED_LIST_PLUGINS",
  GET_PLUGIN = "REPLUGGED_GET_PLUGIN",
  GET_PLUGIN_PLAINTEXT_PATCHES = "REPLUGGED_GET_PLUGIN_PLAINTEXT_PATCHES",
  UNINSTALL_PLUGIN = "REPLUGGED_UNINSTALL_PLUGIN",
  GET_ADDON_INFO = "REPLUGGED_GET_ADDON_INFO",
  INSTALL_ADDON = "REPLUGGED_INSTALL_ADDON",
  OPEN_PLUGINS_FOLDER = "REPLUGGED_OPEN_PLUGINS_FOLDER",
  OPEN_THEMES_FOLDER = "REPLUGGED_OPEN_THEMES_FOLDER",
  OPEN_SETTINGS_FOLDER = "REPLUGGED_OPEN_SETTINGS_FOLDER",
  OPEN_QUICKCSS_FOLDER = "REPLUGGED_OPEN_QUICKCSS_FOLDER",
  GET_REPLUGGED_VERSION = "REPLUGGED_GET_REPLUGGED_VERSION",
  DOWNLOAD_REACT_DEVTOOLS = "REPLUGGED_DOWNLOAD_REACT_DEVTOOLS",
  CONSOLE = "REPLUGGED_CONSOLE",
}

export interface RepluggedAnnouncement {
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

export interface RepluggedTheme {
  path: string;
  manifest: ThemeManifest;
}

export interface RepluggedPlugin {
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
