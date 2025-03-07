import { ipcMain } from "electron";
import { ReCelledIpcChannels, type ReCelledWebContents } from "../../types";
import "./installer";
import "./plugins";
import "./quick-css";
import "./react-devtools";
import "./settings";
import "./themes";
import { readFileSync } from "fs";
import { join } from "path";

ipcMain.on(ReCelledIpcChannels.GET_DISCORD_PRELOAD, (event) => {
  event.returnValue = (event.sender as ReCelledWebContents).originalPreload;
});

ipcMain.on(ReCelledIpcChannels.GET_RECELLED_RENDERER, (event) => {
  event.returnValue = readFileSync(join(__dirname, "./renderer.js"), "utf-8");
});
