import { rmSync, statSync } from "original-fs";
import { extractAll } from "@electron/asar";
import { join } from "path";

export function unpackAsar(dir: string, file: string): string {
  const filePath = join(dir, file);
  const unpackedName = `${filePath}.unpacked`;
  try {
    if (statSync(filePath).isDirectory() || !filePath.endsWith(".asar")) return filePath;
    extractAll(filePath, unpackedName);
    rmSync(filePath);
  } catch (err) {
    console.log(err);
  }
  console.log(`Asar ${filePath} replaced with folder`);
  return unpackedName;
}
