import { SpawnOptions, execSync, spawn } from "child_process";
import { DiscordPlatform, ProcessInfo, UserData } from "./types.mjs";

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

export const getProcessInfoByName = (processName: string): ProcessInfo | null => {
  if (process.platform === "win32") {
    const command = `tasklist /FI "IMAGENAME eq ${processName}.exe" /FO CSV`;
    const output = execSync(command).toString().trim();

    const lines = output.split("\r\n");
    if (lines.length <= 2) {
      return null;
    }

    const [_header, data] = lines.slice(0, 2);
    const [name, pid] = data.split('","');

    return { pid: Number(pid), cmd: name.substring(1).split(/\s+/) };
  }
  const command = `ps -eo pid,command | grep -E "(^|/)${processName}(\\s|$)" | grep -v grep`;

  const output = execSync(command).toString().trim();

  if (output.length === 0) {
    return null;
  }

  const [pid, ...cmd] = output.split(/\s+/);

  return { pid: Number(pid), cmd };
};

export const killCheckProcessExists = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

export const killProcessByPID = (pid: number): Promise<void> => {
  return new Promise((resolve) => {
    if (!pid) resolve();
    process.kill(pid, "SIGTERM");
    const checkInterval = setInterval(() => {
      if (!killCheckProcessExists(pid)) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 6000);
  });
};

export const openProcess = (command: string, args?: string[], options?: SpawnOptions): void => {
  void (process.platform === "darwin"
    ? execSync(command)
    : spawn(command, args ?? [], options ?? {}).unref());
};

export const GetUserData = (): UserData => {
  const name = execSync("logname", { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  const env = Object.assign({}, process.env, { HOME: `/home/${name}` });
  const uid = execSync(`id -u ${name}`, { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  const gid = execSync(`id -g ${name}`, { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  return { env, uid: Number(uid), gid: Number(gid) };
};
