import { promisify } from "util";
import { mkdir, rename, rm, writeFile } from "fs/promises";
import { RmOptions } from "fs";
import { DiscordPlatform } from "./types.mjs";
import { exec as execCallback } from "child_process";
import { PRIV_CMD_EXEC } from "src/util.mjs";

const exec = promisify(execCallback);

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

export const privilegedWriteFile = async (file: string, data: string): Promise<void> => {
  if (process.platform === "win32") {
    return writeFile(file, data);
  }

  await exec(`echo "${data.replace(/"/g, '\\"')}" | ${PRIV_CMD_EXEC} tee ${file}`);
};

export const privilegedRename = async (oldPath: string, newPath: string): Promise<void> => {
  if (process.platform === "win32") {
    return rename(oldPath, newPath);
  }

  await exec(`${PRIV_CMD_EXEC} mv ${oldPath} ${newPath}`);
};

export const privilegedMkdir = async (path: string): Promise<void> => {
  if (process.platform === "win32") {
    return mkdir(path);
  }

  await exec(`${PRIV_CMD_EXEC} mkdir ${path}`);
};

// Note: This function does not support maxRetries or retryDelay on non-win32 platforms
export const privilegedRm = async (path: string, options?: RmOptions): Promise<void> => {
  if (process.platform === "win32") {
    return rm(path, options);
  }

  let strOptions = [options?.force ? "-f" : "", options?.recursive ? "-r" : ""];
  await exec(`${PRIV_CMD_EXEC} rm ${strOptions.join(" ")} ${path}`);
};
