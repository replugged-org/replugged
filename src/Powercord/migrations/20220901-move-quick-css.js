const { existsSync, renameSync } = require('fs');

module.exports = () => {
  /*
  Check if ../coremods/moduleManager/quickcss.css
  If so, then move it to root
  */

  if (existsSync(`${__dirname}/../coremods/moduleManager/quickcss.css`)) {
    renameSync(`${__dirname}/../coremods/moduleManager/quickcss.css`, `${__dirname}/../../../settings/quickcss/main.css`);
  }
};
