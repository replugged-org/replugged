import { ipcMain } from "electron";
import { join } from "path";
import { readFileSync } from "fs";
import "./plugins";
import "./themes";
import "./quick-css";
import "./settings";
import { RepluggedIpcChannels, RepluggedWebContents } from "../../types";

ipcMain.on(RepluggedIpcChannels.GET_DISCORD_PRELOAD, (event) => {
  console.log(event);
  event.returnValue = (event.sender as RepluggedWebContents).originalPreload;
});
