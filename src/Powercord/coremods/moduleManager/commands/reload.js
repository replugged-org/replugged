const { resp } = require('../util');
const { ApplicationCommandOptionType } = require('powercord/commands');
const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'reload',
  description: Messages.REPLUGGED_COMMAND_RELOAD_DESC,
  usage: '{c} [ plugin/theme ID ]',
  executor ([ id ]) {
    const isPlugin = powercord.pluginManager.plugins.has(id);
    const isTheme = powercord.styleManager.themes.has(id);

    if (!isPlugin && !isTheme) { // No match
      return resp(false, Messages.REPLUGGED_ERROR_COULD_NOT_FIND_PLUGIN_THEME.format({ id }));
    } else if (isPlugin && isTheme) { // Duplicate name
      return resp(false, Messages.REPLUGGED_ERROR_PLUGIN_THEME_IS_IN_USE.format({ id }));
    }

    const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;

    manager.remount(id);
    return resp(true, Messages.REPLUGGED_COMMAND_RELOAD_RELOADED.format({
      type: isPlugin ? 'Plugin' : 'Theme',
      id
    }));
  },
  options: [
    {
      name: 'entity',
      displayName: 'entity',
      description: 'the plugin or theme to reload',
      displayDescription: 'The plugin or theme to reload',
      type: ApplicationCommandOptionType.STRING,
      required: true,
      get choices () {
        const choices = [];

        const plugins = Array.from(powercord.pluginManager.plugins.values());
        const themes = Array.from(powercord.styleManager.themes.values());

        plugins.map(plugin => {
          choices.push({
            name: Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_PLUGIN.format({ plugin: plugin.entityID,
              description: plugin.manifest.description }),
            displayName: Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_PLUGIN.format({ plugin: plugin.entityID,
              description: plugin.manifest.description }),
            value: plugin.entityID
          });

          return plugin;
        });

        themes.map(theme => {
          choices.push({
            name:  Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_THEME.format({ theme: theme.entityID,
              description: theme.manifest.description }),
            displayName:  Messages.REPLUGGED_COMMAND_AUTOCOMPLETE_THEME.format({ theme: theme.entityID,
              description: theme.manifest.description }),
            value: theme.entityID
          });

          return theme;
        });

        return choices.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  ]
};
