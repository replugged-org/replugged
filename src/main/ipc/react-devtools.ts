import AdmZip from "adm-zip";
import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import { join } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { RepluggedIpcChannels } from "../../types";
import { getSetting } from "./settings";

const OUTPUT_PATH = join(CONFIG_PATHS["react-devtools"]);
const ZIP_PATH = join(OUTPUT_PATH, "extension.zip");

ipcMain.handle(RepluggedIpcChannels.DOWNLOAD_REACT_DEVTOOLS, async () => {
  const apiUrl = await getSetting("dev.replugged.Settings", "apiUrl", "https://replugged.dev");
  const REACT_DEVTOOLS_URL = `${apiUrl}/api/v1/react-devtools`;

  let buffer;

  if (existsSync(ZIP_PATH)) {
    buffer = readFileSync(ZIP_PATH);
  } else {
    const arrayBuffer = await fetch(REACT_DEVTOOLS_URL)
      .then((res) => res.arrayBuffer())
      .catch(() => {
        throw new Error("Could not download React DevTools");
      });
    buffer = Buffer.from(new Uint8Array(arrayBuffer));

    writeFileSync(ZIP_PATH, buffer);
  }

  const zip = new AdmZip(buffer);

  return new Promise<void>((resolve, reject) => {
    zip.extractAllToAsync(OUTPUT_PATH, true, false, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
});
