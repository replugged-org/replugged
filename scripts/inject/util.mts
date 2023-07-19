import { DiscordPlatform } from "./types.mjs";
import { execSync } from "child_process";

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

function isCommandInstalled(command: string): boolean {
  try {
    execSync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
}

const ELEVATION_TOOLS = ["doas", "sudo", "su -c"];
const DETECTED_TOOLS = ELEVATION_TOOLS.filter((x) => isCommandInstalled(x));

if (DETECTED_TOOLS.length === 0) {
  console.error(
    `${AnsiEscapes.RED}Failed to detect any tool for elevation. Assuming no tools are is required.${AnsiEscapes.RESET}`,
  );
}

export const PRIV_CMD_EXEC = DETECTED_TOOLS[0];
