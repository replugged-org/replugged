require('./elevate');
require('./env_check')(); // Perform checks
require('../polyfills'); // And then do stuff

const { join } = require('path');
const { writeFile } = require('fs').promises;
const { BasicMessages, AnsiEscapes } = require('./log');
const main = require('./main.js');

let platformModule;
try {
  platformModule = require(`./${process.platform}.js`);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(BasicMessages.PLUG_FAILED, '\n');
    console.log('It seems like your platform is not supported yet.', '\n');
    console.log(
      'Feel free to open an issue about it, so we can add support for it!'
    );
    console.log(
      `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`
    );
    console.log(
      'https://github.com/replugged-org/replugged/issues/new/choose'
    );
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
}

let platform = process.argv[4]?.toLowerCase();

(async () => {
  const exists = main.checkPlatform(platform);

  if (!exists) {
    platform = 'stable';
    console.log(`${AnsiEscapes.YELLOW}No valid platform specified, defaulting to "${platform}".${AnsiEscapes.RESET}\n`);
  } else if (platform === 'development') {
    platform = 'dev';
  } else {
    platform = platform.toLowerCase();
  }

  if (process.argv[2] === 'inject') {
    try {
      if (!exists) {
        for (const current of main.VALID_PLATFORMS) {
          const installed = await main.exists(platformModule, current);
          if (installed) {
            result = await main.inject(platformModule, current);
            platform = current;
            if (!result) {
              console.log(`${AnsiEscapes.YELLOW}${current} is installed but already plugged, skipping.${AnsiEscapes.RESET}`);
              continue;
            }
            break;
          } else {
            console.log(`${AnsiEscapes.RED}${current} is not installed, skipping.${AnsiEscapes.RESET}`);
          }
        }

        if (result) {
          console.log(`${AnsiEscapes.GREEN}${platform} is installed, successfully plugged.${AnsiEscapes.RESET}\n`);
        } else {
          console.log(`\n${AnsiEscapes.RED}No valid platform is installed, exiting.${AnsiEscapes.RESET}\n`);
          process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
        }
      } else {
        result = await main.inject(platformModule, platform);
      }
    } catch (e) {
      // this runs if path generator crashes (app folder doesnt exist)
      console.log(`${AnsiEscapes.RED}Platform you specified isn't installed on this device!${AnsiEscapes.RESET}\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${main.VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
      process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
    }
    if (result) {
      if (!process.argv.includes('--no-welcome-message')) {
        await writeFile(
          join(__dirname, '../src/__injected.txt'),
          'hey cutie'
        );
      }

      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, '\n');
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To plug into a different platform, use the following syntax: ${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}npm run plug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${main.VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`
      );
    }
  } else if (process.argv[2] === 'uninject') {
    try {
      if (!exists) {
        for (const current of main.VALID_PLATFORMS) {
          const installed = await main.exists(platformModule, current);
          if (installed) {
            result = await main.uninject(platformModule, current, true);
            platform = current;
            if (result) break;
          } else {
            console.log(`${AnsiEscapes.RED}${current} is not plugged, skipping.${AnsiEscapes.RESET}`);
          }
        }

        if (result) {
          console.log(`${AnsiEscapes.GREEN}${platform} is plugged, successfully unplugged.${AnsiEscapes.RESET}\n`);
        } else {
          console.log(`\n${AnsiEscapes.RED}No valid platform is plugged, exiting.${AnsiEscapes.RESET}\n`);
          process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
        }
      } else {
        result = await main.uninject(platformModule, platform, false);
      }
    } catch (e) {
      // this runs if path generator crashes (app folder doesnt exist)
      console.log(`${AnsiEscapes.RED}Platform you specified isn't installed on this device!${AnsiEscapes.RESET}\n\nList of valid platforms:\n${AnsiEscapes.GREEN}${main.VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
      process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
    }
    if (result) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, '\n');
      console.log(
        `You now have to completely close the Discord client, from the system tray or through the task manager.\n
To unplug from a different platform, use the following syntax: ${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}npm run unplug <platform>${AnsiEscapes.RESET}
List of valid platforms:\n${AnsiEscapes.GREEN}${main.VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`
      );
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting.`);
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
})().catch(e => {
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
List of valid platforms:\n${AnsiEscapes.GREEN}${main.VALID_PLATFORMS.map(x => `${x}`).join('\n')}${AnsiEscapes.RESET}`);
  } else {
    console.error(`${AnsiEscapes.BOLD}${AnsiEscapes.RED}Something went wrong! Error info:${AnsiEscapes.RESET}\n`, e);
  }
});
