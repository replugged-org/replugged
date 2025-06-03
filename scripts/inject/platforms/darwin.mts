import type { DiscordPlatform } from "../types.mjs";

const PATHS = {
  stable: "/Applications/Discord.app/Contents/Resources/app.asar",
  ptb: "/Applications/Discord PTB.app/Contents/Resources/app.asar",
  canary: "/Applications/Discord Canary.app/Contents/Resources/app.asar",
  dev: "/Applications/Discord Development.app/Contents/Resources/app.asar",
};

export const getAppDir = (platform: DiscordPlatform): string => PATHS[platform];
