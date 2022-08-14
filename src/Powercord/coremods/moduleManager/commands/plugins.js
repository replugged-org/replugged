const { CORE_PLUGINS } = require('powercord/constants');

module.exports = {
  command: 'plugins',
  aliases: [ 'plist' ],
  description: 'Prints out a list of currently installed plugins.',
  usage: '{c}',
  executor () {
    const plugins = powercord.pluginManager.getPlugins()
      .filter(p => !CORE_PLUGINS.includes(p));

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
