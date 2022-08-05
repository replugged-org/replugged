import "./elevate";
import "./env_check";

import "../polyfills";

import { join } from "path";
import { writeFile } from "fs/promises";
import { BasicMessages } from "./log";
import { inject, uninject } from "./main";
import { platforms } from "./types";

import * as darwin from "./darwin";
import * as linux from "./linux";
import * as win32 from "./win32";

const platformModules = {
  darwin,
  linux,
  win32,
};

if (!(process.platform in platformModules)) {
  console.log(BasicMessages.PLUG_FAILED, "\n");
  console.log("It seems like your platform is not supported yet.", "\n");
  console.log(
    "Feel free to open an issue about it, so we can add support for it!"
  );
  console.log(
    `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`
  );
  console.log("https://github.com/replugged-org/replugged/issues/new/choose");
  process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
}

const platformModule =
  platformModules[process.platform as keyof typeof platformModules];

const VALID_PLATFORMS = ["stable", "ptb", "canary", "dev", "development"];

(async () => {
  let platform: platforms;
  {
    let p = (
      process.argv.find((x) => VALID_PLATFORMS.includes(x.toLowerCase())) ||
      "stable"
    ).toLowerCase();
    if (p === "development") {
      p = "dev";
    }

    platform = p as platforms;
  }

  if (process.argv[2] === "inject") {
    if (await inject(platformModule, platform)) {
      if (!process.argv.includes("--no-welcome-message")) {
        await writeFile(join(__dirname, "../src/__injected.txt"), "hey cutie");
      }

      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, "\n");
      console.log(
        "You now have to completely close the Discord client, from the system tray or through the task manager."
      );
    }
  } else if (process.argv[2] === "uninject") {
    if (await uninject(platformModule, platform)) {
      console.log(BasicMessages.UNPLUG_SUCCESS, "\n");
      console.log(
        "You now have to completely close the Discord client, from the system tray or through the task manager."
      );
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting.`);
    process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
  }
})().catch((e) => {
  console.error("fucky wucky", e);
});
