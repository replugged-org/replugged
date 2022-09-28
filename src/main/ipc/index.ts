import { ipcMain } from "electron";
import "./plugins";
import "./themes";
import "./quick-css";
import type { RepluggedWebContents } from "../../types";

ipcMain.on("REPLUGGED_GET_DISCORD_PRELOAD", (event) => {
  console.log(event);
  event.returnValue = (event.sender as RepluggedWebContents).originalPreload;
});
// Handle requesting renderer code
