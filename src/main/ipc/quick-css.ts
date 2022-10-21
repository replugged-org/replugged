import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";

const cssPath = join(__dirname, "../../../settings/quickcss/main.css");

ipcMain.handle(RepluggedIpcChannels.GET_QUICK_CSS, () => readFile(cssPath, { encoding: "utf-8" }));
ipcMain.on(RepluggedIpcChannels.SAVE_QUICK_CSS, (_, css) =>
  writeFile(cssPath, css, { encoding: "utf-8" }),
);
