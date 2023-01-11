import type { WebContents } from "electron";
import type { CommandOptions, ConnectedAccount } from "./discord";
import type { PluginManifest, ThemeManifest } from "./addon";

export type RepluggedWebContents = WebContents & {
  originalPreload?: string;
};

export enum RepluggedIpcChannels {
  GET_DISCORD_PRELOAD = "REPLUGGED_GET_DISCORD_PRELOAD",
  GET_QUICK_CSS = "REPLUGGED_GET_QUICK_CSS",
  SAVE_QUICK_CSS = "REPLUGGED_SAVE_QUICK_CSS",
  GET_SETTING = "REPLUGGED_GET_SETTING",
  SET_SETTING = "REPLUGGED_SET_SETTING",
  HAS_SETTING = "REPLUGGED_HAS_SETTING",
  DELETE_SETTING = "REPLUGGED_DELETE_SETTING",
  GET_ALL_SETTINGS = "REPLUGGED_GET_ALL_SETTINGS",
  START_SETTINGS_TRANSACTION = "REPLUGGED_START_SETTINGS_TRANSACTION",
  END_SETTINGS_TRANSACTION = "REPLUGGED_END_SETTINGS_TRANSACTION",
  LIST_THEMES = "REPLUGGED_LIST_THEMES",
  GET_THEME = "REPLUGGED_GET_THEME",
  UNINSTALL_THEME = "REPLUGGED_UNINSTALL_THEME",
  LIST_PLUGINS = "REPLUGGED_LIST_PLUGINS",
  GET_PLUGIN = "REPLUGGED_GET_PLUGIN",
  UNINSTALL_PLUGIN = "REPLUGGED_UNINSTALL_PLUGIN",
  REGISTER_RELOAD = "REPLUGGED_REGISTER_RELOAD",
  CHECK_UPDATE = "REPLUGGED_CHECK_UPDATE",
  INSTALL_UPDATE = "REPLUGGED_INSTALL_UPDATE",
  GET_HASH = "REPLUGGED_GET_HASH",
  OPEN_PLUGINS_FOLDER = "REPLUGGED_OPEN_PLUGINS_FOLDER",
  OPEN_THEMES_FOLDER = "REPLUGGED_OPEN_THEMES_FOLDER",
  OPEN_SETTINGS_FOLDER = "REPLUGGED_OPEN_SETTINGS_FOLDER",
  OPEN_QUICKCSS_FOLDER = "REPLUGGED_OPEN_QUICKCSS_FOLDER",
}

export interface RepluggedAnnouncement {
  message: string;
  color?: string;
  onClose?: () => void;
  button?: {
    text: string;
    onClick: () => void;
  };
}

export interface RepluggedToastButton {
  size?: string;
  look?: string;
  color?: string;
  onClick: () => void;
  text: string;
}

export interface RepluggedToast {
  header: string;
  content: string;
  timeout?: number;
  className?: string;
  buttons?: RepluggedToastButton[];
}

export interface RepluggedCommand {
  name: string;
  description: string;
  usage: string;
  executor: (args: unknown) => void;
  options: CommandOptions;
}

export interface RepluggedConnection {
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

export interface RepluggedTheme {
  path: string;
  manifest: ThemeManifest;
}

export interface RepluggedPlugin {
  path: string;
  manifest: PluginManifest;
}

export * from "./discord";
export type { PluginExports, PluginManifest, ThemeManifest } from "./addon";
export * from "./settings";
export * from "./util";
export * from "./webpack";
export * from "./updater";
