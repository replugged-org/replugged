const fse = require('fs-extra');
const { normalize } = require('path');

const oldDir = normalize('./src/Powercord/plugins/')
const newDir = normalize('./plugins/')

// Copy plugins from old directory to new one
fse.move(oldDir, newDir, { overwrite: true }, err => {
  if(err) return console.error(err);
  console.log('Plugins moved successfully');
});