const { existsSync, renameSync, unlinkSync } = require('fs');
const path = require('path');

module.exports = () => {

  const settingsPath = `${__dirname}/../../../settings`;
  const files = {
    'pc-general.json': 'coremods/general.json',
    'pc-moduleManager.json': 'coremods/moduleManager.json',
    'pc-updater.json': 'coremods/updater.json',
    'rp-migrations.json': 'coremods/migrations.json',
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
    const source = path.resolve(`${settingsPath}/${setting}`);
    const target = path.resolve(`${settingsPath}/${files[setting]}`);
  
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
