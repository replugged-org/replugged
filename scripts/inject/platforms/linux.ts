import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import readline from "readline";
import { DiscordPlatform } from "../types";
import { AnsiEscapes, PlatformNames } from "../util";

const installDirFile = join(__dirname, "../../../.installdir-");

const ProcessRegex = {
  stable: /discord$/i,
  ptb: /discord-?ptb$/i,
  canary: /discord-?canary$/i,
  dev: /discord-?development$/i,
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
    let discordPath = KnownLinuxPaths[platform].find((path) => existsSync(path));
    if (!discordPath) {
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
      discordPath = await askPath();
      readlineInterface.close();

      if (!existsSync(discordPath)) {
        console.log("");
        console.log(
          `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
        );
        console.log("The path you provided is invalid.");
        process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
      }
    }

    return join(discordPath, "resources", "app.asar");
  }

  const discordPath = discordProcess[4].split("/");
  discordPath.splice(discordPath.length - 1, 1);
  return join("/", ...discordPath, "resources", "app.asar");
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string> => {
  const installDirPath = installDirFile + platform;
  if (existsSync(installDirPath)) {
    return readFileSync(installDirPath, "utf8");
  }
  const appDir = await findAppDir(platform);
  writeFileSync(installDirPath, appDir);
  return appDir;
};
