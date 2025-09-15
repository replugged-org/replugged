import AdmZip from "adm-zip";
import { ipcMain } from "electron";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";
import { RepluggedIpcChannels } from "src/types";
import { CONFIG_PATHS } from "src/util.mjs";

const OUTPUT_PATH = join(CONFIG_PATHS["react-devtools"]);
const REACT_DEVTOOLS_URL = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3Dfmkadmapgofadopljbjfkapdkoienihi%26uc&prodversion=${process.versions.chrome}`;

export function crxToZip(buf: Buffer): Buffer {
  if (buf.length < 12) throw new Error("Input too short to be CRX/ZIP.");

  // Quick ZIP check: "PK\x03\x04"
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    return buf;
  }

  // CRX magic: "Cr24"
  if (!(buf[0] === 0x43 && buf[1] === 0x72 && buf[2] === 0x32 && buf[3] === 0x34)) {
    throw new Error('Invalid header: does not start with "Cr24" or ZIP magic.');
  }

  const version = buf.readUInt32LE(4);

  if (version === 2) {
    if (buf.length < 16) throw new Error("CRX v2 header truncated.");
    const publicKeyLength = buf.readUInt32LE(8);
    const signatureLength = buf.readUInt32LE(12);
    const zipStart = 16 + publicKeyLength + signatureLength;

    if (zipStart > buf.length) throw new Error("Invalid CRX v2 header: sizes extend past buffer.");
    return buf.subarray(zipStart);
  }

  if (version === 3) {
    if (buf.length < 12) throw new Error("CRX v3 header truncated.");
    const headerSize = buf.readUInt32LE(8);
    const zipStart = 12 + headerSize;

    if (zipStart > buf.length)
      throw new Error("Invalid CRX v3 header: headerSize extends past buffer.");
    return buf.subarray(zipStart);
  }

  throw new Error(`Unsupported CRX version: ${version}.`);
}

ipcMain.handle(RepluggedIpcChannels.DOWNLOAD_REACT_DEVTOOLS, async (): Promise<void> => {
  const response = await fetch(REACT_DEVTOOLS_URL).catch(() => {
    throw new Error("Could not download React DevTools");
  });

  if (!response.ok) {
    throw new Error(`Failed to download React DevTools: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const downloadedBuffer = Buffer.from(arrayBuffer);
  const buffer = crxToZip(downloadedBuffer);

  const zipData = new AdmZip(buffer);

  return new Promise<void>((resolve, reject) => {
    zipData.extractAllToAsync(OUTPUT_PATH, true, false, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

ipcMain.handle(RepluggedIpcChannels.REMOVE_REACT_DEVTOOLS, async (): Promise<void> => {
  if (existsSync(OUTPUT_PATH)) await rm(OUTPUT_PATH, { recursive: true, force: true });
});
