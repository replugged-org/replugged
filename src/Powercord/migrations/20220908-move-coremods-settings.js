const { existsSync, renameSync } = require('fs');

module.exports = () => {
  // Check if coremod settings exist.

  if (existsSync(`${__dirname}/../../../settings/pc-general.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-general.json`, `${__dirname}/../../../settings/coremods/general.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-moduleManager.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-moduleManager.json`, `${__dirname}/../../../settings/coremods/moduleManager.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-updater.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-updater.json`, `${__dirname}/../../../settings/coremods/updater.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/rp-migrations.json`)) {
    renameSync(`${__dirname}/../../../settings/rp-migrations.json`, `${__dirname}/../../../settings/coremods/migrations.json`);
  }

  // Check formerly built in plugins.

  if (existsSync(`${__dirname}/../../../settings/pc-clickableEdits.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-clickableEdits.json`, `${__dirname}/../../../settings/clickableEdits.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-emojiUtility.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-emojiUtility.json`, `${__dirname}/../../../settings/emojiUtility.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-heygirl.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-heygirl.json`, `${__dirname}/../../../settings/heygirl.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-clickableEdits.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-clickableEdits.json`, `${__dirname}/../../../settings/clickableEdits.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-codeblocks.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-codeblocks.json`, `${__dirname}/../../../settings/better-codeblocks.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-lmgtfy.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-lmgtfy.json`, `${__dirname}/../../../settings/lmgtfy.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-mock.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-mock.json`, `${__dirname}/../../../settings/mock.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-tags.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-tags.json`, `${__dirname}/../../../settings/tags.json`);
  }

  if (existsSync(`${__dirname}/../../../settings/pc-spotify.json`)) {
    renameSync(`${__dirname}/../../../settings/pc-spotify.json`, `${__dirname}/../../../settings/spotify-modal.json`);
  }
};
