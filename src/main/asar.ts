import { renameSync, rmSync, statSync } from "original-fs";
import { extractAll } from "@electron/asar";

export function unpackAsar(filePath: string): void {
  const unpackedName = `${filePath}.unpacked`;
  try {
    if (statSync(filePath).isDirectory() || !filePath.endsWith(".asar")) return;
    extractAll(filePath, unpackedName);
    rmSync(filePath);
    renameSync(unpackedName, filePath);
  } catch (err) {
    console.log(err);
  }
  console.log(`Asar ${filePath} replaced with folder`);
}
