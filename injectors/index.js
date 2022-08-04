require('./elevate');
require('./env_check')(); // Perform checks
require('../polyfills'); // And then do stuff

const { join } = require('path');
const { writeFile } = require('fs').promises;
const { BasicMessages } = require('./log');
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

const VALID_PLATFORMS = [ 'stable', 'ptb', 'canary', 'dev', 'development' ];

(async () => {
  let platform = (
    process.argv.find(x => VALID_PLATFORMS.includes(x.toLowerCase())) || 'stable'
  ).toLowerCase();
  if (platform === 'development') {
    platform = 'dev';
  }

  if (process.argv[2] === 'inject') {
    if (await main.inject(platformModule, platform)) {
      if (!process.argv.includes('--no-welcome-message')) {
        await writeFile(
          join(__dirname, '../src/__injected.txt'),
          'hey cutie'
        );
      }

      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, '\n');
      console.log(
        'You now have to completely close the Discord client, from the system tray or through the task manager.'
      );
    }
  } else if (process.argv[2] === 'uninject') {
    if (await main.uninject(platformModule, platform)) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, '\n');
      console.log(
        'You now have to completely close the Discord client, from the system tray or through the task manager.'
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
      'Replugged wasn\'t able to inject itself due to missing permissions.',
      '\n'
    );
    console.log('Try again with elevated permissions.');
  } else {
    console.error('fucky wucky', e);
  }
});
