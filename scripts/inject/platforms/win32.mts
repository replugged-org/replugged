import { readdir } from "fs/promises";
import { join } from "path";
import type { DiscordPlatform } from "../types.mjs";

const PATHS = {
  stable: "Discord",
  ptb: "DiscordPTB",
  canary: "DiscordCanary",
  dev: "DiscordDevelopment",
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string> => {
  const discordPath = join(process.env.LOCALAPPDATA!, PATHS[platform]);
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory.filter((path) => path.startsWith("app-")).reverse()[0];

  return join(discordPath, currentBuild, "resources", "app.asar");
};
