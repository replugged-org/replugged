import electron from 'electron';

export type RepluggedWebContents = electron.WebContents & {
  originalPreload?: string;
};

export enum RepluggedIpcChannels {
  GET_DISCORD_PRELOAD = 'REPLUGGED_GET_DISCORD_PRELOAD',
  GET_RENDERER_SCRIPT = 'REPLUGGED_GET_RENDERER_SCRIPT'
}
