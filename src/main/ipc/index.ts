import { ipcMain } from "electron";
import { readFileSync } from "fs";
import { join } from "path";
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

ipcMain.on(RepluggedIpcChannels.GET_REPLUGGED_RENDERER, (event) => {
  event.returnValue = readFileSync(join(__dirname, "./renderer.js"), "utf-8");
});
