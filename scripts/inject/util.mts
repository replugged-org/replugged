import { type SpawnOptions, execSync, spawn } from "child_process";
import type { DiscordPlatform, ProcessInfo, UserData } from "./types.mjs";

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

export const getProcessInfoByName = (processName: string): ProcessInfo[] | null => {
  try {
    const isWindows = process.platform === "win32";
    const command = isWindows
      ? `powershell -Command "(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq '${processName}.exe' } | Select-Object ParentProcessId,ProcessId | ConvertTo-Csv -NoTypeInformation)"`
      : `ps -eo ppid,pid,command | grep -E "${processName}${process.platform === "darwin" ? ".app" : " --type"}" | grep -v grep`;
    const output = execSync(command).toString().trim();

    if (!output) return null;
    const lines = output.split(isWindows ? "\r\n" : "\n").slice(1);

    const processInfo = lines.map((line) => {
      const [ppid, pid] = line
        .trim()
        .replaceAll('"', "")
        .split(isWindows ? "," : /\s+/);

      return {
        ppid: Number(ppid),
        pid: Number(pid),
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return processInfo || null;
  } catch {
    return null;
  }
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
  if (process.platform === "darwin") {
    void execSync(command);
  } else {
    spawn(command, args ?? [], options ?? {}).unref();
  }
};

export const getUserData = (): UserData => {
  const name = execSync("logname", { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  const env = Object.assign({}, process.env, { HOME: `/home/${name}` });
  const uid = execSync(`id -u ${name}`, { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  const gid = execSync(`id -g ${name}`, { encoding: "utf8" }).toString().trim().replace(/\n$/, "");
  return { env, uid: Number(uid), gid: Number(gid) };
};
