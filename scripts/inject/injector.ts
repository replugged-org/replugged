import { copyFile, mkdir, rename, rm, stat, writeFile } from "fs/promises";
import { join } from "path";
import { AnsiEscapes } from "./util";
import readline from "readline";
import { exec } from "child_process";
import { DiscordPlatform, PlatformModule } from "./types";
import { CONFIG_PATH } from "../../src/util";

export const isDiscordInstalled = async (appDir: string, silent?: boolean): Promise<boolean> => {
  try {
    await stat(appDir);
    return true;
  } catch {
    if (!silent) {
      console.error(
        `${AnsiEscapes.RED}The Discord installation you specified isn't installed on this device!${AnsiEscapes.RESET}`,
      );
    }
    return false;
  }
};

export const isPlugged = async (appDir: string): Promise<boolean> => {
  try {
    await stat(join(appDir, "..", "app.orig.asar"));
    return true;
  } catch {
    return false;
  }
};

export const inject = async (
  { getAppDir }: PlatformModule,
  platform: DiscordPlatform,
  prod: boolean,
): Promise<boolean> => {
  const appDir = await getAppDir(platform);
  if (!(await isDiscordInstalled(appDir))) return false;

  if (await isPlugged(appDir)) {
    /*
     * @todo: verify if there is nothing in discord_desktop_core as well
     * @todo: prompt to automatically uninject and continue
     */
    console.error(
      `${AnsiEscapes.RED}Looks like you already have an injector in place. Try unplugging (\`npm run unplug\`) and try again.${AnsiEscapes.RESET}`,
      "\n",
    );
    console.error(
      `${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} If you already have BetterDiscord or another client mod injected, Replugged cannot run along with it!`,
      "\n",
    );
    console.error(
      `If you already have Replugged installed and want to replace it, use ${AnsiEscapes.GREEN}npm run replug${AnsiEscapes.RESET} to unplug and plug again.`,
    );
    return false;
  }

  const fileToCheck = join(__dirname, "..", "..", prod ? "app.asar" : "dist/main.js");
  const fileToCheckExists = await stat(fileToCheck)
    .then(() => true)
    .catch(() => false);
  if (!fileToCheckExists) {
    console.error(
      `${AnsiEscapes.RED}Looks like you haven't built Replugged yet!${AnsiEscapes.RESET}`,
    );
    console.error(
      `To build for development, run ${AnsiEscapes.GREEN}npm run build${AnsiEscapes.RESET}`,
    );
    console.error(
      `To build for production, run ${AnsiEscapes.GREEN}npm run bundle${AnsiEscapes.RESET}`,
    );
    return false;
  }

  if (appDir.includes("flatpak")) {
    const discordName = platform === "canary" ? "DiscordCanary" : "Discord";
    const overrideCommand = `${
      appDir.startsWith("/var") ? "sudo flatpak override" : "flatpak override --user"
    } com.discordapp.${discordName} --filesystem=${join(__dirname, "..")}`;
    const updateScript = `
    #!/bin/bash
    shopt -s globstar
    
    for folder in ${join(__dirname, "..")}/**/.git; do
      (cd "$folder/.." && echo "Pulling $PWD" && git pull)
    done`;
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askExecCmd = (): Promise<string> =>
      new Promise((resolve) =>
        readlineInterface.question("Would you like to execute the command now? y/N: ", resolve),
      );
    const askViewScript = (): Promise<string> =>
      new Promise((resolve) =>
        readlineInterface.question(
          "To update Replugged and its plugins, you need to pull in changes with git manually. A script is available for this however. View it? Y/n: ",
          resolve,
        ),
      );

    console.warn(
      `${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} You seem to be using the Flatpak version of Discord.`,
    );
    console.warn(
      "Some Replugged features such as auto updates won't work properly with Flatpaks.",
      "\n",
    );
    console.warn("You'll need to allow Discord to access Replugged's installation directory");
    console.warn(
      `You can allow access to Replugged's directory with this command: ${AnsiEscapes.YELLOW}${overrideCommand}${AnsiEscapes.RESET}`,
    );

    const doCmd = await askExecCmd();

    if (doCmd === "y" || doCmd === "yes") {
      console.log("Running...");
      exec(overrideCommand);
    } else {
      console.log("OK. The command will not be executed.", "\n");
    }

    const viewScript = await askViewScript();
    if (viewScript === "" || viewScript === "y" || viewScript === "yes") {
      console.log(`${AnsiEscapes.YELLOW}${updateScript}${AnsiEscapes.RESET}`);
    }
    readlineInterface.close();
  }

  try {
    await rename(appDir, join(appDir, "..", "app.orig.asar"));
  } catch {
    console.error(
      `${AnsiEscapes.RED}Failed to rename app.asar while plugging. If Discord is open, make sure it is closed.${AnsiEscapes.RESET}`,
    );
    process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
  }

  const entryPoint = prod
    ? join(CONFIG_PATH, "app.asar")
    : join(__dirname, "..", "..", "dist/main.js");

  if (prod) {
    await copyFile(join(__dirname, "..", "..", "app.asar"), entryPoint);
  }

  await mkdir(appDir);
  await Promise.all([
    writeFile(join(appDir, "index.js"), `require("${entryPoint}")`),
    writeFile(
      join(appDir, "package.json"),
      JSON.stringify({
        main: "index.js",
        name: "discord",
      }),
    ),
  ]);

  return true;
};

export const uninject = async (
  { getAppDir }: PlatformModule,
  platform: DiscordPlatform,
): Promise<boolean> => {
  const appDir = await getAppDir(platform);
  if (
    !(await isDiscordInstalled(appDir, true)) &&
    !(await isDiscordInstalled(join(appDir, "..", "app.orig.asar")))
  )
    return false;

  if (!(await isPlugged(appDir))) {
    console.error(
      `${AnsiEscapes.BOLD}${AnsiEscapes.RED}There is nothing to unplug. You are already running Discord without mods.${AnsiEscapes.RESET}`,
    );
    return false;
  }

  await rm(appDir, { recursive: true, force: true });
  await rename(join(appDir, "..", "app.orig.asar"), appDir);
  return true;
};
