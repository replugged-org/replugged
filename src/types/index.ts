import electron from 'electron';

export type RepluggedWebContents = electron.WebContents & {
  originalPreload?: string;
};
