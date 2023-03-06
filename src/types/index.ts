import type { WebContents } from "electron";
import type { CommandOptionReturn, CommandOptions, ConnectedAccount } from "./discord";
import type { PluginManifest, ThemeManifest } from "./addon";
import { Embed } from "discord-types/general";

export type RepluggedWebContents = WebContents & {
  originalPreload?: string;
};

export enum RepluggedIpcChannels {
  GET_I18N_STRINGS = "REPLUGGED_GET_I18N_STRINGS",
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
  GET_ADDON_INFO = "REPLUGGED_GET_ADDON_INFO",
  INSTALL_ADDON = "REPLUGGED_INSTALL_ADDON",
  OPEN_PLUGINS_FOLDER = "REPLUGGED_OPEN_PLUGINS_FOLDER",
  OPEN_THEMES_FOLDER = "REPLUGGED_OPEN_THEMES_FOLDER",
  OPEN_SETTINGS_FOLDER = "REPLUGGED_OPEN_SETTINGS_FOLDER",
  OPEN_QUICKCSS_FOLDER = "REPLUGGED_OPEN_QUICKCSS_FOLDER",
  GET_REPLUGGED_VERSION = "REPLUGGED_GET_REPLUGGED_VERSION",
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
  applicationId?: string;
  type?: number;
  id?: string;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  usage: string;
  executor: (args: CommandOptionReturn[]) => Promise<RepluggedCommandResult>;
  execute?: (args: CommandOptionReturn[]) => Promise<void>;
  options?: CommandOptions[];
}

export interface RepluggedCommandEmbed extends Omit<Embed, "fields" | "id" | "type" | "rawDescription" | "rawTitle" | "referenceId" | "url" | "color"> {
  fields?: [];
  id?: string;
  type?: string;
  rawDescription?: string;                                                                                    
  rawTitle?: string;
  referenceId?: unknown;
  url?: string;
  color: string | number;
}

export type RepluggedCommandResult = {
  send: boolean;
  result: string;
  embeds?: RepluggedCommandEmbed[];
} | {
  send: false; // Never send if embeds is specified. Considered self-botting
  result?: string;
  embeds: RepluggedCommandEmbed[];
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
  hasCSS: boolean;
}

export interface RepluggedTranslations {
  [key: string]: RepluggedTranslations;
}

export * from "./discord";
export type { PluginExports, PluginManifest, ThemeManifest, AnyAddonManifest } from "./addon";
export * from "./settings";
export * from "./util";
export * from "./webpack";
export * from "./installer";
