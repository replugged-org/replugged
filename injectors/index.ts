import "./elevate";
import envCheck from "./env_check";
envCheck();

import "../polyfills";

import { join } from "path";
import { writeFile } from "fs/promises";
import readline from "readline";
import { AnsiEscapes, BasicMessages } from "./log";
import { inject, uninject } from "./main";
import { platforms } from "./types";

import * as darwin from "./darwin";
import * as linux from "./linux";
import * as win32 from "./win32";

async function promptYesNo(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

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
      "canary"
    ).toLowerCase();
    if (p === "development") {
      p = "dev";
    }

    platform = p as platforms;
  }

  if (platform !== "canary" && process.argv[2] === "inject") {
    console.log(
      `${AnsiEscapes.BOLD}${AnsiEscapes.YELLOW}WARNING: using non-canary versions of Discord is not supported.${AnsiEscapes.RESET}`
    );
    console.log(
      `${AnsiEscapes.YELLOW}These versions may not work properly and support will not be given.${AnsiEscapes.RESET}`
    );
    const response = await promptYesNo(
      "Are you sure you want to continue? [y/n]: "
    );
    if (!response) {
      console.log("Aborting...");
      process.exit(process.argv.includes("--no-exit-codes") ? 0 : 1);
    }
    console.log("Continuing...", "\n");
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
      // @todo: prompt to (re)start automatically
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
  if (e.code === "EACCES") {
    // todo: this was linux only (?) so I assume this is now safe to delete
    console.log(
      process.argv[2] === "inject"
        ? BasicMessages.PLUG_FAILED
        : BasicMessages.UNPLUG_FAILED,
      "\n"
    );
    console.log(
      "Replugged wasn't able to inject itself due to missing permissions.",
      "\n"
    );
    console.log("Try again with elevated permissions.");
  } else {
    console.error("fucky wucky", e);
  }
});
