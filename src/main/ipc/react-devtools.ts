import AdmZip from "adm-zip";
import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import { join } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { RepluggedIpcChannels } from "../../types";

const OUTPUT_PATH = join(CONFIG_PATHS["react-devtools"]);
const ZIP_PATH = join(OUTPUT_PATH, "extension.zip");

// https://github.com/facebook/react/issues/25843#issuecomment-1406766561
const EXTENSION_URL =
  "https://github.com/mondaychen/react/raw/017f120369d80a21c0e122106bd7ca1faa48b8ee/packages/react-devtools-extensions/ReactDevTools.zip";

ipcMain.handle(RepluggedIpcChannels.DOWNLOAD_REACT_DEVTOOLS, async () => {
  let buffer;

  if (existsSync(ZIP_PATH)) {
    buffer = readFileSync(ZIP_PATH);
  } else {
    const arrayBuffer = await fetch(EXTENSION_URL)
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
