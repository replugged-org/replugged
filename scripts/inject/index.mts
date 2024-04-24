// Pre-inject checks
import "./checks/elevate.mjs";
import "./checks/env.mjs";

import { join } from "path";
import { AnsiEscapes, getCommand } from "./util.mjs";
import { inject, uninject } from "./injector.mjs";

import * as darwin from "./platforms/darwin.mjs";
import * as linux from "./platforms/linux.mjs";
import * as win32 from "./platforms/win32.mjs";
import { DiscordPlatform } from "./types.mjs";
import { existsSync } from "fs";
import { createContext, getPositionalArg } from "@marshift/argus";

const platformModules = {
  darwin,
  linux,
  win32,
};

const ctx = createContext(process.argv);

export const exitCode = ctx.hasOptionalArg(/--no-exit-codes/) ? 0 : 1;
const prod = ctx.hasOptionalArg(/--production/);
export const entryPoint = ctx.getOptionalArg(/--entryPoint/);

if (!(process.platform in platformModules)) {
  console.error(
    `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
    "\n",
  );
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

const run = async (cmd = ctx.getPositionalArg(2), replug = false): Promise<void> => {
  if (!platform) {
    const platformArg = getPositionalArg(ctx.argv, 3, false)?.toLowerCase();

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
              "\n",
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
      console.log(
        `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Replugged has been successfully ${
          replug ? "replugged" : "plugged"
        } :D${AnsiEscapes.RESET}`,
        "\n",
      );
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To plug into a different platform, use the following syntax: ${AnsiEscapes.BOLD}${
          AnsiEscapes.GREEN
        }${getCommand({ action: replug ? "replug" : "plug", prod })}${AnsiEscapes.RESET}`,
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
      if (replug) {
        console.log("Unplug successful, continuing to replug...", "\n");
      } else {
        // @todo: prompt to (re)start automatically
        console.log(
          `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Replugged has been successfully unplugged${AnsiEscapes.RESET}`,
          "\n",
        );
        console.log(
          `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To unplug from a different platform, use the following syntax: ${AnsiEscapes.BOLD}${
            AnsiEscapes.GREEN
          }${getCommand({ action: "unplug", prod })}${AnsiEscapes.RESET}`,
        );
      }
    }
  } else if (cmd === "reinject") {
    await run("uninject", true);
    await run("inject", true);
  } else {
    console.error(`Unsupported argument "${cmd}", exiting.`);
    process.exit(exitCode);
  }
};

run();
