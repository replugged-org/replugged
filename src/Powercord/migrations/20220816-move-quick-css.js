const { existsSync, renameSync, rmdirSync } = require('fs');

module.exports = () => {
  /*
  Check if ../plugins/pc-moduleManager/quickcss.css exists
  If so, then move it to ../coremods/moduleManager/quickcss.css
  Then delete ../plugins/pc-moduleManager
  */

  if (existsSync(`${__dirname}/../plugins/pc-moduleManager/quickcss.css`)) {
    renameSync(`${__dirname}/../plugins/pc-moduleManager/quickcss.css`, `${__dirname}/../../../settings/quickcss/main.css`);
    rmdirSync(`${__dirname}/../plugins/pc-moduleManager`);
  }
};
