const { existsSync, renameSync, unlinkSync } = require('fs');
const path = require('path');

module.exports = () => {

  const settingsPath = `${__dirname}/../../../settings`;
  const files = {
    "pc-general.json": "coremods/general.json",
    "pc-moduleManager.json": "coremods/moduleManager.json",
    "pc-updater.json": "coremods/updater.json",
    "rp-migrations.json": "coremods/migrations.json",
    "pc-clickableEdits.json": "clickableEdits.json",
    "pc-emojiUtility.json": "emojiUtility.json",
    "pc-heygirl.json": "heygirl.json",
    "pc-hastebin.json": "hastebin.json",
    "pc-codeblocks.json": "better-codeblocks.json",
    "pc-lmgtfy.json": "lmgtfy.json",
    "pc-mock.json": "mock.json",
    "pc-tags.json": "tags.json",
    "pc-spotify.json": "spotify-modal.json"
  };

  for (const setting in files) {
    if (existsSync(`${settingsPath}/${setting}`)) {
      if (!existsSync(`${settingsPath}/${files[setting]}`)) {
        renameSync(`${settingsPath}/${setting}`, `${settingsPath}/${files[setting]}`);
      }
    }
  }
};
