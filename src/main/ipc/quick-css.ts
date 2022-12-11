import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";
import { CONFIG_PATH } from "src/util";

const CSS_PATH = join(CONFIG_PATH, "quickcss.css");

ipcMain.handle(RepluggedIpcChannels.GET_QUICK_CSS, () => readFile(CSS_PATH, { encoding: "utf-8" }));
ipcMain.on(RepluggedIpcChannels.SAVE_QUICK_CSS, (_, css: string) =>
  writeFile(CSS_PATH, css, { encoding: "utf-8" }),
);
