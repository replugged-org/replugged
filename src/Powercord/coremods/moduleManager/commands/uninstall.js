const { i18n: { Messages } } = require('powercord/webpack');

const { resp, promptUninstall } = require('../util');

module.exports = {
  command: 'uninstall',
  description: Messages.REPLUGGED_COMMAND_UNINSTALL_DESC,
  usage: '{c} [ plugin/theme ID ]',
  executor ([ id ]) {
    const isPlugin = powercord.pluginManager.plugins.has(id);
    const isTheme = powercord.styleManager.themes.has(id);

    if (!isPlugin && !isTheme) { // No match
      return resp(false, Messages.REPLUGGED_ERROR_COULD_NOT_FIND_PLUGIN_THEME.format({ id }));
    } else if (isPlugin && isTheme) { // Duplicate name
      return resp(false, Messages.REPLUGGED_ERROR_PLUGIN_THEME_IS_IN_USE.format({ id }));
    }

    promptUninstall(id, isPlugin);
  },

  autocomplete (args) {
    const plugins = Array.from(powercord.pluginManager.plugins.values())
      .filter(plugin =>
        !plugin.entityID.startsWith('pc-') &&
        plugin.entityID.toLowerCase().includes(args[0]?.toLowerCase())
      );

    const themes = Array.from(powercord.styleManager.themes.values())
      .filter(theme =>
        theme.entityID.toLowerCase().includes(args[0]?.toLowerCase())
      );

    if (args.length > 1) {
      return false;
    }

    return {
      header: Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_ENTITY_LIST,
      commands: [
        ...plugins.map(plugin => ({
          command: plugin.entityID,
          description: Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_PLUGIN.format({ description: plugin.manifest.description })
        })),
        ...themes.map(theme => ({
          command: theme.entityID,
          description: Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_THEME.format({ description: theme.manifest.description })
        }))
      ]
    };
  }
};
