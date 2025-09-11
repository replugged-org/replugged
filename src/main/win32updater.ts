import { basename, join } from "path";
import { cpSync, existsSync, readdirSync, renameSync } from "fs";
import { getSetting } from "./ipc/settings";

function getVersionFromName(name: string): number[] {
  return name.replace("app-", "").split(".").map(Number);
}

function getPathBefore(path: string, before: string): string {
  return join(path.substring(0, path.indexOf(before)));
}

export default function patchAutoStartUpdate(): void {
  const replugSetting = getSetting<boolean>("dev.replugged.Settings", "winUpdater", false);
  if (process.platform !== "win32" || !replugSetting) return;

  // require.main!.filename -> %localappdata%\discord\app-x.x.x\resources\app.orig.asar\app_bootstrap\index.js

  // origAsarPath -> %localappdata%\discord\app-x.x.x\resources\app.orig.asar
  const origAsarPath = getPathBefore(require.main!.filename, "\\app_bootstrap\\index");
  // currentAsarDir -> %localappdata%/discord/app-x.x.x/resources/app.asar (folder)
  const currentAsarDir = join(origAsarPath, "..", "app.asar");
  // currentVersion -> app-x.x.x
  const currentVersion = basename(getPathBefore(origAsarPath, "\\resources\\app."));
  // discordPath -> %localappdata%/discord
  const discordPath = getPathBefore(origAsarPath, `${currentVersion}\\resources`);
  // autoStartPath -> %localappdata%\discord\app-x.x.x\resources\app.orig.asar\app_bootstrap\autoStart\index.js
  const autoStartPath = join(require.main!.filename, "..", "autoStart", "index.js");

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
    // rename app.asar -> app.orig.asar in newer app\x.x.x\resources
    if (!existsSync(origAsar)) renameSync(asar, origAsar);
    // copy over the old app.asar from old app-x.x.x\resources
    cpSync(currentAsarDir, asar, { recursive: true });
    await update(cb);
  };
}
