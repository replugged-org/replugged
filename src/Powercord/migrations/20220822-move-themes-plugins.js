const fs = require('fs');
const { join } = require('path');

module.exports = () => {
  const oldPlugs = join(__dirname, '..', 'plugins');
  const newPlugs = join(__dirname, '..', '..', '..', 'user', 'plugins');
  const oldThemes = join(__dirname, '..', 'themes');
  const newThemes = join(__dirname, '..', '..', '..', 'user', 'themes');


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
};
