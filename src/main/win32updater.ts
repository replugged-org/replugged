import { basename, join } from "path";
import { cpSync, existsSync, readdirSync, renameSync } from "fs";

function getVersionFromName(name: string): number[] {
  return name.replace("app-", "").split(".").map(Number);
}

export default function addUpdateListener(): void {
  if (process.platform !== "win32") return;
  // app-x.x.x/resources/asar/app_bootstrap/index.js
  const origAsarPath = join(require.main!.filename, "..", "..");
  const currentAsarDir = join(origAsarPath, "..", "app.asar");
  const currentVersion = basename(join(origAsarPath, "..", ".."));
  const discordPath = join(origAsarPath, "..", "..", "..");
  const autoStartPath = join(origAsarPath, "app_bootstrap", "autoStart", "index.js");
  const { update } = require(autoStartPath);

  require.cache[autoStartPath]!.exports.update = async (cb?: () => unknown) => {
    const newVersion = readdirSync(discordPath).reduce((oldVersionString, newVersionString) => {
      if (!newVersionString.startsWith("app-")) return oldVersionString;
      const oldVersion = getVersionFromName(oldVersionString);
      const newVersion = getVersionFromName(newVersionString);
      if (newVersion.some((n, i) => n > oldVersion[i])) return newVersionString;
      return oldVersionString;
    }, currentVersion);

    if (newVersion === currentVersion) return;

    const newResources = join(discordPath, newVersion, "resources");

    const asar = join(newResources, "app.asar");
    const origAsar = join(newResources, "app.orig.asar");
    if (!existsSync(origAsar)) renameSync(asar, origAsar);

    cpSync(currentAsarDir, asar, { recursive: true });
    await update(cb);
  };
}
