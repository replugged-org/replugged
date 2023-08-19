import { ipcMain } from "electron";
import "./plugins";
import "./themes";
import "./quick-css";
import "./settings";
import "./installer";
import "./i18n";
import "./react-devtools";
import { RepluggedIpcChannels, type RepluggedWebContents } from "../../types";

ipcMain.on(RepluggedIpcChannels.GET_DISCORD_PRELOAD, (event) => {
  event.returnValue = (event.sender as RepluggedWebContents).originalPreload;
});
