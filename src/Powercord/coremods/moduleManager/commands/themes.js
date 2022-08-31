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
      title: Messages.REPLUGGED_COMMAND_LIST_OF_INSTALLED({
        type: Messages.REPLUGGED_THEMES,
        count: themes.length
      }),
      description: `\`${themes.join('\n')}\``
    };

    return {
      send: false,
      result
    };
  }
};
