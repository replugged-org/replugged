import { mkdir, rename, rm, stat, writeFile } from "fs/promises";
import { join, sep } from "path";
import { AnsiEscapes } from "./util";
import readline from "readline";
import { exec } from "child_process";
import { DiscordPlatform, PlatformModule } from "./types";

export const inject = async (
  { getAppDir }: PlatformModule,
  platform: DiscordPlatform,
): Promise<boolean> => {
  const appDir = await getAppDir(platform);
  if ((await stat(appDir)).isDirectory()) {
    /*
     * @todo: verify if there is nothing in discord_desktop_core as well
     * @todo: prompt to automatically uninject and continue
     */
    console.log(
      `${AnsiEscapes.RED}Looks like you already have an injector in place. Try unplugging (\`npm run unplug\`) and try again.${AnsiEscapes.RESET}`,
      "\n",
    );
    console.log(
      `${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} If you already have BetterDiscord or another client mod injected, Replugged cannot run along with it!`,
    );
    console.log("Read our FAQ for more details: https://replugged.dev/faq#bd-and-pc");
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

    console.log(
      `${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} You seem to be using the Flatpak version of Discord.`,
    );
    console.log(
      "Some Replugged features such as auto updates won't work properly with Flatpaks.",
      "\n",
    );
    console.log("You'll need to allow Discord to access Replugged's installation directory");
    console.log(
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
    console.log(
      `${AnsiEscapes.RED}Failed to rename app.asar while plugging. If Discord is open, make sure it is closed.${AnsiEscapes.RESET}`,
    );
    process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
  }

  await mkdir(appDir);
  await Promise.all([
    writeFile(
      join(appDir, "index.js"),
      `require(\`${__dirname.replace(RegExp(sep.repeat(2), "g"), "/")}/../../dist/main.js\`)`,
    ),
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

  if (!(await stat(appDir)).isDirectory()) {
    console.log(
      `${AnsiEscapes.BOLD}${AnsiEscapes.RED}There is nothing to unplug. You are already running Discord without mods.${AnsiEscapes.RESET}`,
    );
    return false;
  }

  await rm(appDir, { recursive: true, force: true });
  await rename(join(appDir, "..", "app.orig.asar"), appDir);
  return true;
};
