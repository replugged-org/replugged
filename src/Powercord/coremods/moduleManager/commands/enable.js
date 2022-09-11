const { resp } = require('../util');
const { ApplicationCommandOptionType } = require('powercord/commands');
const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'enable',
  description: Messages.REPLUGGED_COMMAND_ENABLE_DESC,
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
    if (manager.isEnabled(id)) {
      return resp(false, Messages.REPLUGGED_ERROR_PLUGIN_THEME_ALREADY_ENABLED.format({ id }));
    }

    manager.enable(id);
    return resp(true, Messages.REPLUGGED_COMMAND_ENABLE_ENABLED.format({
      type: isPlugin ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME,
      id
    }));
  },
  options: [
    {
      name: 'entity',
      displayName: 'entity',
      description: 'the plugin or theme to enable',
      displayDescription: 'The plugin or theme to enable',
      type: ApplicationCommandOptionType.STRING,
      required: true,
      get choices () {
        const choices = [];

        const plugins = Array.from(powercord.pluginManager.plugins.values())
          .filter(plugin => !powercord.pluginManager.isEnabled(plugin.entityID));

        const themes = Array.from(powercord.styleManager.themes.values())
          .filter(theme => !powercord.styleManager.isEnabled(theme.entityID));

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
