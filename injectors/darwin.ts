import { AppDirGetter } from "./types";

const PATHS = {
  stable: "/Applications/Discord.app/Contents/Resources/app",
  ptb: "/Applications/Discord PTB.app/Contents/Resources/app",
  canary: "/Applications/Discord Canary.app/Contents/Resources/app",
  dev: "/Applications/Discord Development.app/Contents/Resources/app",
};

export const getAppDir: AppDirGetter = async (platform) => PATHS[platform];
