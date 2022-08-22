const fs = require('fs');
const { join } = require('path');

module.exports = () => {
  const oldPlugs = join(__dirname, '..', 'plugins');
  const newPlugs = join(__dirname, '..', '..', '..', 'plugins');
  const oldThemes = join(__dirname, '..', 'themes');
  const newThemes = join(__dirname, '..', '..', '..', 'themes');


  // This function recursively moves all subdirectories and files from src to dest
  let moveRecursiveSync = function(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    fs.readdirSync(src).forEach((name) => {
      fs.renameSync(join(src, name), join(dest, name));
    });
  };

  moveRecursiveSync(oldPlugs, newPlugs);
  fs.rmdirSync(oldPlugs);
  moveRecursiveSync(oldThemes, newThemes);
  fs.rmdirSync(oldThemes);
};
