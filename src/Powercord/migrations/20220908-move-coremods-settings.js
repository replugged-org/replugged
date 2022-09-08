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

  
};
