import { ipcMain } from "electron";
import { RepluggedIpcChannels, type RepluggedWebContents } from "../../types";
import "./installer";
import "./plugins";
import "./quick-css";
import "./react-devtools";
import "./settings";
import "./themes";
import { readFileSync } from "fs";
import { join } from "path";

ipcMain.on(RepluggedIpcChannels.GET_DISCORD_PRELOAD, (event) => {
  event.returnValue = (event.sender as RepluggedWebContents).originalPreload;
});

ipcMain.on(RepluggedIpcChannels.GET_REPLUGGED_RENDERER, (event) => {
  event.returnValue = `try { (() => {\n${readFileSync(join(__dirname, "./renderer.js"), "utf-8")}\n})()\n} catch (err) { console.error(err); }\n\n//# sourceURL=RepluggedRenderer`;
});
