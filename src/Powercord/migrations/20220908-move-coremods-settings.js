const { existsSync, renameSync, unlinkSync } = require('fs');
const { SETTINGS_FOLDER } = require('powercord/constants');
const path = require('path');

module.exports = () => {
  const files = {
    'pc-general.json': 'core/general.json',
    'pc-moduleManager.json': 'core/moduleManager.json',
    'pc-updater.json': 'core/updater.json',
    'rp-migrations.json': 'core/migrations.json',
    'pc-clickableEdits.json': 'clickableEdits.json',
    'pc-emojiUtility.json': 'emojiUtility.json',
    'pc-heygirl.json': 'heygirl.json',
    'pc-hastebin.json': 'hastebin.json',
    'pc-codeblocks.json': 'better-codeblocks.json',
    'pc-lmgtfy.json': 'lmgtfy.json',
    'pc-mock.json': 'mock.json',
    'pc-tags.json': 'tags.json',
    'pc-spotify.json': 'spotify-modal.json'
  };

  for (const setting in files) {
    const source = path.resolve(`${SETTINGS_FOLDER}/${setting}`);
    const target = path.resolve(`${SETTINGS_FOLDER}/${files[setting]}`);

    if (existsSync(source)) {
      if (!existsSync(target)) {
        renameSync(source, target);
        if (existsSync(source)) {
          unlinkSync(source);
        }
      }
    }
  }
};
