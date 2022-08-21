const fs = require('fs');
const { join } = require('path');

module.exports = () => {
  const oldPlugs = join(__dirname, '..', 'plugins')
  const newPlugs = join(__dirname, '..', '..', '..', 'plugins')
  const oldThemes = join(__dirname, '..', 'themes')
  const newThemes = join(__dirname, '..', '..', '..', 'themes')

  const rmdirOpt = {recursive: true}

  // This function recursively moves all subdirectories and files from src to dest
  var copyRecursiveSync = function(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      try {
        fs.mkdirSync(dest);
      } catch (e) {}
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(join(src, childItemName),
                          join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursiveSync(oldPlugs, newPlugs);
  fs.rmdirSync(oldPlugs, rmdirOpt)
  copyRecursiveSync(oldThemes, newThemes);
  fs.rmdirSync(oldThemes, rmdirOpt)
};