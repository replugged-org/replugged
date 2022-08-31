const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'themes',
  aliases: [ 'tlist' ],
  description: Messages.REPLUGGED_COMMAND_THEMES_DESC,
  usage: '{c}',
  executor () {
    const themes = powercord.styleManager.getThemes();
    const result = {
      type: 'rich',
      title: `List of Installed Themes (${themes.length})`,
      description: `\`${themes.join('\n')}\``
    };

    return {
      send: false,
      result
    };
  }
};
