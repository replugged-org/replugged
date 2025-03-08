import { ipcMain } from "electron";
import { RepluggedIpcChannels, type RepluggedWebContents } from "../../types";
import "./installer";
import "./plugins";
import "./quick-css";
import "./react-devtools";
import "./settings";
import "./themes";

ipcMain.on(RepluggedIpcChannels.GET_DISCORD_PRELOAD, (event) => {
  event.returnValue = (event.sender as RepluggedWebContents).originalPreload;
});
