import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ipcMain, shell } from "electron";
import { ReCelledIpcChannels } from "../../types";
import { CONFIG_PATHS } from "src/util.mjs";

const CSS_PATH = join(CONFIG_PATHS.quickcss, "main.css");

ipcMain.handle(ReCelledIpcChannels.GET_QUICK_CSS, () =>
  readFile(CSS_PATH, { encoding: "utf-8" }).catch(() => ""),
);
ipcMain.on(ReCelledIpcChannels.SAVE_QUICK_CSS, (_, css: string) =>
  writeFile(CSS_PATH, css, { encoding: "utf-8" }),
);
ipcMain.on(ReCelledIpcChannels.OPEN_QUICKCSS_FOLDER, () => shell.openPath(CONFIG_PATHS.quickcss));
