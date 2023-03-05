import { DiscordPlatform } from "./types";

export const AnsiEscapes = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
};

export const PlatformNames = {
  stable: "Discord",
  ptb: "Discord PTB",
  canary: "Discord Canary",
  dev: "Discord Development",
};

export const getCommand = ({
  action,
  platform,
  prod,
}: {
  action: string;
  platform?: DiscordPlatform;
  prod: boolean;
}): string => {
  let cmd = `pnpm run ${action}`;
  if (prod) cmd += " --production";
  cmd += ` ${platform || `[${Object.keys(PlatformNames).join("|")}]`}`;
  return cmd;
};
