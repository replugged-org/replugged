const fs = require('fs');
const { join } = require('path');
const { PLUGINS_FOLDER , THEMES_FOLDER , SETTINGS_FOLDER } = require('powercord/constants');

module.exports = () => {
  const oldPlugs = join(__dirname, '..', '..', '..', 'plugins');
  const newPlugs = join(PLUGINS_FOLDER);
  const oldThemes = join(__dirname, '..', '..', '..', 'themes');
  const newThemes = join(THEMES_FOLDER);
  const oldSettings = join(__dirname, '..', '..', '..', 'settings');
  const newSettings = join(SETTINGS_FOLDER);

  // This function recursively moves all subdirectories and files from src to dest
  let moveRecursiveSync = function(src, dest) {
    fs.readdirSync(src).forEach((name) => {
      fs.renameSync(join(src, name), join(dest, name));
    });
  };

  if (fs.existsSync(oldPlugs)) {
    moveRecursiveSync(oldPlugs, newPlugs);
    fs.rmdirSync(oldPlugs);
  }
  if (fs.existsSync(oldThemes)) {
    moveRecursiveSync(oldThemes, newThemes);
    fs.rmdirSync(oldThemes);
  }
  if (fs.existsSync(oldSettings)) {
    moveRecursiveSync(oldSettings, newSettings);
    fs.rmdirSync(oldSettings);
  }
};
