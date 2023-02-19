// Pre-inject checks
import "./checks/elevate";
import "./checks/env";

import { join } from "path";
import { AnsiEscapes, BasicMessages } from "./util";
import { inject, uninject } from "./injector";

import * as darwin from "./platforms/darwin";
import * as linux from "./platforms/linux";
import * as win32 from "./platforms/win32";
import { DiscordPlatform } from "./types";
import { existsSync } from "fs";

const platformModules = {
  darwin,
  linux,
  win32,
};

const exitCode = process.argv.includes("--no-exit-codes") ? 0 : 1;
const prod = process.argv.includes("--production");
const homeArg = process.argv
  .find((v) => v.startsWith("--home="))
  ?.replace(/^--home=/, "")
  ?.replace(/^"(.*)"$/, "$1");
const xdgDataHomeArg = process.argv
  .find((v) => v.startsWith("--xdg-data-home="))
  ?.replace(/^--xdg-data-home=/, "")
  ?.replace(/^"(.*)"$/, "$1");
if (homeArg) {
  process.env.HOME = homeArg;
  delete process.env.XDG_DATA_HOME;
}
if (xdgDataHomeArg) {
  process.env.XDG_DATA_HOME = xdgDataHomeArg;
}
const processArgs = process.argv.filter((v) => !v.startsWith("-"));

if (!(process.platform in platformModules)) {
  console.error(BasicMessages.PLUG_FAILED, "\n");
  console.error("It seems like your platform is not supported yet.", "\n");
  console.error("Feel free to open an issue about it, so we can add support for it!");
  console.error(
    `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`,
  );
  console.error("https://github.com/replugged-org/replugged/issues/new/choose");
  process.exit(exitCode);
}

const platformModule = platformModules[process.platform as keyof typeof platformModules];

const VALID_PLATFORMS = ["stable", "ptb", "canary", "dev"] as const;
const checkPlatform = (platform: string): platform is DiscordPlatform =>
  VALID_PLATFORMS.includes(platform as DiscordPlatform);
const checkInstalled = (appDir: string): boolean => existsSync(join(appDir, ".."));

let platform: DiscordPlatform | undefined;

const run = async (cmd = processArgs[2]): Promise<void> => {
  {
    const platformArg = processArgs[3]?.toLowerCase();

    if (platformArg) {
      const exists = checkPlatform(platformArg);
      if (platformArg === "development") {
        platform = "dev";
      } else if (!exists) {
        console.error(
          `${AnsiEscapes.RED}Platform you specified isn't valid, please specify a valid one.${
            AnsiEscapes.RESET
          }\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(
            (x) => `${x}`,
          ).join("\n")}${AnsiEscapes.RESET}`,
        );
        process.exit(exitCode);
      } else {
        platform = platformArg;
      }
    } else {
      for (const current of VALID_PLATFORMS) {
        try {
          const appDir = await platformModule.getAppDir(current);
          const installed = checkInstalled(appDir);
          if (installed) {
            console.warn(
              `${AnsiEscapes.YELLOW}No platform specified, defaulting to "${current}".${AnsiEscapes.RESET}`,
            );
            platform = current;
            break;
          }
        } catch {}
      }

      if (!platform) {
        console.error(
          `${AnsiEscapes.RED}Could not find any installations of Discord.${AnsiEscapes.RESET}`,
        );
        process.exit(exitCode);
      }
    }
  }
  let result;

  if (cmd === "inject") {
    try {
      result = await inject(platformModule, platform, prod);
    } catch (e) {
      console.error(
        `${AnsiEscapes.RED}An error occurred while trying to inject into Discord!${AnsiEscapes.RESET}`,
      );
      console.error(e);
      process.exit(exitCode);
    }
    if (result) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, "\n");
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To plug into a different platform, use the following syntax: ${AnsiEscapes.BOLD}${
          AnsiEscapes.GREEN
        }pnpm run plug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map((x) => `${x}`).join("\n")}${
          AnsiEscapes.RESET
        }`,
      );
    } else {
      process.exit(exitCode);
    }
  } else if (cmd === "uninject") {
    try {
      result = await uninject(platformModule, platform);
    } catch (e) {
      console.error(
        `${AnsiEscapes.RED}An error occurred while trying to uninject from Discord!${AnsiEscapes.RESET}`,
      );
      console.error(e);
      process.exit(exitCode);
    }
    if (result) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, "\n");
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To unplug from a different platform, use the following syntax: ${AnsiEscapes.BOLD}${
          AnsiEscapes.GREEN
        }pnpm run unplug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map((x) => `${x}`).join("\n")}${
          AnsiEscapes.RESET
        }`,
      );
    }
  } else if (cmd === "reinject") {
    await run("uninject");
    await run("inject");
  } else {
    console.error(`Unsupported argument "${cmd}", exiting.`);
    process.exit(exitCode);
  }
};

run();
