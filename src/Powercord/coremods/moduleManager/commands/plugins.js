const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'plugins',
  aliases: [ 'plist' ],
  description: Messages.REPLUGGED_COMMAND_PLUGINS_DESC,
  usage: '{c}',
  executor () {
    const plugins = powercord.pluginManager.getPlugins();

    const result = {
      type: 'rich',
      title: `List of Installed Plugins (${plugins.length})`,
      description: `\`${plugins.join('\n')}\``
    };

    return {
      send: false,
      result
    };
  }
};
