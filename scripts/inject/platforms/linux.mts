import path, { basename, join } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import readline from "readline";
import { DiscordPlatform } from "../types.mjs";
import { AnsiEscapes, PlatformNames } from "../util.mjs";
import { exitCode } from "../index.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const installDirFile = join(dirname, "../../../.installdir-");

const ProcessRegex = {
  stable: /discord$/i,
  ptb: /discord-?ptb$/i,
  canary: /discord-?canary$/i,
  dev: /discord-?development$/i,
};

const findAppAsarInDir = (dir: string): string | null => {
  const name = basename(dir);
  if (name === "app.asar") return dir;
  const topLevelAsar = join(dir, "app.asar");
  if (existsSync(topLevelAsar)) return topLevelAsar;
  const resourcesAsar = join(dir, "resources", "app.asar");
  if (existsSync(resourcesAsar)) return resourcesAsar;

  return null;
};

const findPathFromPaths = async (
  platform: DiscordPlatform,
  paths: string[],
): Promise<string | null> => {
  let discordPaths = paths.filter((path) => existsSync(path));
  if (discordPaths.length === 0) {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askPath = (): Promise<string> =>
      new Promise((resolve) => readlineInterface.question("> ", resolve));
    console.log(
      `${AnsiEscapes.YELLOW}Failed to locate ${PlatformNames[platform]} installation folder.${AnsiEscapes.RESET}`,
      "\n",
    );
    console.log(`Please provide the path of your ${PlatformNames[platform]} installation folder`);
    let discordPath = await askPath();
    readlineInterface.close();

    if (!existsSync(discordPath)) {
      console.log("");
      console.log(
        `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
      );
      console.log("The path you provided is invalid.");
      process.exit(exitCode);
    }
  }

  let path: string | null = null;
  for (let discordPath of discordPaths) {
    path = findAppAsarInDir(discordPath);
    if (path !== null) return path;
    else
      console.log(
        `Potential Discord directory ${discordPath} exists but does not contain a valid Discord installation. This may be remnants of an old installation, checking other potential locations...`,
      );
  }
  return null;
};

const findAppDir = async (platform: DiscordPlatform): Promise<string> => {
  // This is to ensure the homedir we get is the actual user's homedir instead of root's homedir
  const homedir = execSync('grep $(logname) /etc/passwd | cut -d ":" -f6').toString().trim();
  const flatpakDir = "/var/lib/flatpak/app/com.discordapp";
  const homeFlatpakDir = `${homedir}/.local/share/flatpak/app/com.discordapp`;

  const KnownLinuxPaths = {
    stable: [
      "/usr/share/discord",
      "/usr/lib/discord",
      "/usr/lib64/discord",
      "/opt/discord",
      "/opt/Discord",
      `${flatpakDir}.Discord/current/active/files/discord`,
      `${homeFlatpakDir}.Discord/current/active/files/discord`,
      `${homedir}/.local/bin/Discord`,
    ],
    ptb: [
      "/usr/share/discord-ptb",
      "/usr/lib/discord-ptb",
      "/usr/lib64/discord-ptb",
      "/opt/discord-ptb",
      "/opt/DiscordPTB",
      `${homedir}/.local/bin/DiscordPTB`,
    ],
    canary: [
      "/usr/share/discord-canary",
      "/usr/lib/discord-canary",
      "/usr/lib64/discord-canary",
      "/opt/discord-canary",
      "/opt/DiscordCanary",
      `${flatpakDir}.DiscordCanary/current/active/files/discord-canary`,
      `${homeFlatpakDir}.DiscordCanary/current/active/files/discord-canary`,
      `${homedir}/.local/bin/DiscordCanary`, // https://github.com/powercord-org/powercord/pull/370
    ],
    dev: [
      "/usr/share/discord-development",
      "/usr/lib/discord-development",
      "/usr/lib64/discord-development",
      "/opt/discord-development",
      "/opt/DiscordDevelopment",
      `${homedir}/.local/bin/DiscordDevelopment`,
    ],
  };

  const discordProcess = execSync("ps x")
    .toString()
    .split("\n")
    .map((s) => s.split(" ").filter(Boolean))
    .find((p) => p[4] && ProcessRegex[platform].test(p[4]) && p.includes("--type=renderer"));

  if (!discordProcess) {
    const fromPath = await findPathFromPaths(platform, KnownLinuxPaths[platform]);
    if (!fromPath) {
      console.log("Failed to find Discord path");
      process.exit(exitCode);
    }

    return fromPath;
  }

  const discordPath = discordProcess[4].split("/");
  discordPath.splice(discordPath.length - 1, 1);
  const path = findAppAsarInDir(join("/", ...discordPath));
  if (!path) {
    console.log("Failed to find app.asar from Discord process, checking by path");

    const fromPath = await findPathFromPaths(platform, KnownLinuxPaths[platform]);
    if (!fromPath) {
      console.log("Failed to find Discord path");
      process.exit(exitCode);
    }

    return fromPath;
  }

  return path;
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string> => {
  const installDirPath = installDirFile + platform;
  if (existsSync(installDirPath)) {
    const path = readFileSync(installDirPath, "utf8").trim();
    if (existsSync(path)) return path;
    console.log("Failed to find Discord path from previous executions, finding from scratch.");
  }
  const appDir = await findAppDir(platform);
  writeFileSync(installDirPath, appDir);
  return appDir;
};
