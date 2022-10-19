import electron from 'electron';
import { CommandOptions, ConnectedAccount } from './discord';
import { Theme, Plugin } from './addon';

// lexisother(NOTE): :harold:
declare global {
  interface Window {
    React: any;
  }
}

export type RepluggedWebContents = electron.WebContents & {
  originalPreload?: string;
};

export enum RepluggedIpcChannels {
  GET_DISCORD_PRELOAD = 'REPLUGGED_GET_DISCORD_PRELOAD',
  GET_RENDERER_JS = 'REPLUGGED_GET_RENDERER_JS',
  GET_QUICK_CSS = 'REPLUGGED_GET_QUICK_CSS',
  SAVE_QUICK_CSS = 'REPLUGGED_SAVE_QUICK_CSS',
  GET_SETTING = 'REPLUGGED_GET_SETTING',
  SET_SETTING = 'REPLUGGED_SET_SETTING',
  HAS_SETTING = 'REPLUGGED_HAS_SETTING',
  DELETE_SETTING = 'REPLUGGED_DELETE_SETTING',
  GET_ALL_SETTINGS = 'REPLUGGED_GET_ALL_SETTINGS',
  START_SETTINGS_TRANSACTION = 'REPLUGGED_START_SETTINGS_TRANSACTION',
  END_SETTINGS_TRANSACTION = 'REPLUGGED_END_SETTINGS_TRANSACTION',
  LIST_THEMES = 'REPLUGGED_LIST_THEMES',
  UNINSTALL_THEME = 'REPLUGGED_UNINSTALL_THEME',
  LIST_PLUGINS = 'REPLUGGED_LIST_PLUGINS',
  UNINSTALL_PLUGIN = 'REPLUGGED_UNINSTALL_PLUGIN'
}

export type RepluggedAnnouncement = {
  message: string,
  color?: string,
  onClose?: () => void,
  button?: {
    text: string,
    onClick: () => void
  }
};

export type RepluggedToastButton = {
  size?: string,
  look?: string,
  color?: string,
  onClick: () => void,
  text: string
};

export type RepluggedToast = {
  header: string,
  content: string,
  timeout?: number,
  className?: string,
  buttons?: RepluggedToastButton[]
};

export type RepluggedCommand = {
  name: string,
  description: string,
  usage: string,
  executor: (args: unknown) => void,
  options: CommandOptions
};

export type RepluggedConnection = {
  type: string,
  name: string,
  color: string,
  enabled: boolean,
  icon: {
    darkSVG: string,
    lightSVG: string
  }
  fetchAccount: (id: string) => Promise<ConnectedAccount>,
  getPlatformUserUrl?: (account: ConnectedAccount) => string,
  onDisconnect: () => void,
  onConnect: () => void,
  setVisibility: (visible: boolean) => boolean | void,
};

export interface RepluggedTheme {
  id: string,
  manifest: Theme
}

export interface RepluggedPlugin {
  id: string,
  manifest: Plugin
}
