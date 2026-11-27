import { stat } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import type { DiscordPlatform } from "../types.mjs";

const APP_NAMES = {
  stable: "Discord.app",
  ptb: "Discord PTB.app",
  canary: "Discord Canary.app",
  dev: "Discord Development.app",
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string> => {
  const appName = APP_NAMES[platform];

  // User-local installs live in ~/Applications and do not require admin rights to modify
  for (const applicationsDir of [join(homedir(), "Applications"), "/Applications"]) {
    const appDir = join(applicationsDir, appName, "Contents", "Resources", "app.asar");
    const installed = await stat(appDir).then(
      () => true,
      () => false,
    );
    if (installed) return appDir;
  }

  return join("/Applications", appName, "Contents", "Resources", "app.asar");
};
