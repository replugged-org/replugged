// Pre-inject checks
import './checks/elevate';
import './checks/env';

import { join } from 'path';
import { writeFile } from 'fs/promises';
import { BasicMessages, AnsiEscapes } from './util';
import { inject, uninject } from './injector';

import * as darwin from './platforms/darwin';
import * as linux from './platforms/linux';
import * as win32 from './platforms/win32';
import { DiscordPlatform } from './types';
import { existsSync } from 'fs';

const platformModules = {
  darwin,
  linux,
  win32
};

if (!(process.platform in platformModules)) {
  console.log(BasicMessages.PLUG_FAILED, '\n');
  console.log('It seems like your platform is not supported yet.', '\n');
  console.log(
    'Feel free to open an issue about it, so we can add support for it!'
  );
  console.log(
    `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`
  );
  console.log('https://github.com/replugged-org/replugged/issues/new/choose');
  process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
}

const platformModule =
  platformModules[process.platform as keyof typeof platformModules];

const VALID_PLATFORMS = [ 'stable', 'ptb', 'canary', 'dev' ] as const;
const checkPlatform = (platform: string): platform is DiscordPlatform => VALID_PLATFORMS.includes(platform as DiscordPlatform);
const checkInstalled = (appDir: string) => existsSync(join(appDir, '..'));

let platform: DiscordPlatform | undefined;

(async () => {
  {
    const platformArg = process.argv[4]?.toLowerCase();

    if (platformArg) {
      const exists = checkPlatform(platformArg);
      if (platformArg === 'development') {
        platform = 'dev';
      } else if (!exists) {
        console.log(`${AnsiEscapes.RED}Platform you specified isn't valid, please specify a valid one.${AnsiEscapes.RESET}\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
        process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
      } else {
        platform = platformArg;
      }
    } else {
      for (const current of VALID_PLATFORMS) {
        try {
          const appDir = await platformModule.getAppDir(current);
          const installed = checkInstalled(appDir);
          if (installed) {
            console.log(`${AnsiEscapes.YELLOW}No platform specified, defaulting to "${current}".${AnsiEscapes.RESET}`);
            platform = current;
            break;
          }
        } catch (e) {}
      }

      if (!platform) {
        console.log(`${AnsiEscapes.RED}Could not find any installations of Discord.${AnsiEscapes.RESET}`);
        process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
      }
    }
  }
  let result;

  if (process.argv[2] === 'inject') {
    try {
      result = await inject(platformModule, platform);
    } catch (e) {
      // this runs if path generator crashes (app folder doesnt exist)
      console.log(`${AnsiEscapes.RED}Platform you specified isn't installed on this device!${AnsiEscapes.RESET}\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
      process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
    }
    if (result) {
      if (!process.argv.includes('--no-welcome-message')) {
        await writeFile(
          join(__dirname, '../../src/__injected.txt'),
          'hey cutie'
        );
      }

      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, '\n');
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To plug into a different platform, use the following syntax: ${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}npm run plug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`
      );
    }
  } else if (process.argv[2] === 'uninject') {
    try {
      result = await uninject(platformModule, platform);
    } catch (e) {
      // this runs if path generator crashes (app folder doesnt exist)
      console.log(`${AnsiEscapes.RED}Platform you specified isn't installed on this device!${AnsiEscapes.RESET}\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
      process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
    }
    if (result) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, '\n');
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To unplug from a different platform, use the following syntax: ${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}npm run unplug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`
      );
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting.`);
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
}
)().catch(e => {
  if (e.code === 'EACCES') {
    console.log(
      process.argv[2] === 'inject'
        ? BasicMessages.PLUG_FAILED
        : BasicMessages.UNPLUG_FAILED,
      '\n'
    );
    console.log(
      `${AnsiEscapes.BOLD}${AnsiEscapes.YELLOW}Replugged wasn't able to inject itself due to missing permissions.${AnsiEscapes.RESET}`,
      '\n'
    );
    console.log('Try again with elevated permissions.');
  } else if (e.code === 'ENOENT') {
    console.log(
      process.argv[2] === 'inject'
        ? BasicMessages.PLUG_FAILED
        : BasicMessages.UNPLUG_FAILED,
      '\n'
    );
    console.log(
      `${AnsiEscapes.BOLD}${AnsiEscapes.YELLOW}Replugged wasn't able to inject itself because Discord could not be found.${AnsiEscapes.RESET}`,
      '\n'
    );
    console.log(`Make sure that specified platform (${platform}) is installed, or try again with a different platform using: ${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}npm run ${process.argv[2] === 'inject' ? 'plug' : 'unplug'} <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
  } else {
    console.error(`${AnsiEscapes.BOLD}${AnsiEscapes.RED}Something went wrong! Error info:${AnsiEscapes.RESET}\n`, e);
  }
});
