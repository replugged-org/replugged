export type RepluggedWebContents = Electron.WebContents & {
  originalPreload: string;
};
