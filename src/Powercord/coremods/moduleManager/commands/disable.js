const { CORE_PLUGINS } = require('powercord/constants');
const { resp } = require('../util');

module.exports = {
  command: 'disable',
  description: 'Disable a plugin/theme',
  usage: '{c} [ plugin/theme ID ]',
  executor ([ id ]) {
    const isPlugin = powercord.pluginManager.plugins.has(id);
    const isTheme = powercord.styleManager.themes.has(id);

    if (!isPlugin && !isTheme) { // No match
      return resp(false, `Could not find plugin or theme matching "${id}".`);
    } else if (isPlugin && isTheme) { // Duplicate name
      return resp(false, `"${id}" is in use by both a plugin and theme. You will have to disable it from settings.`);
    } else if (isPlugin && CORE_PLUGINS.includes(id)) { // Core internal plugin
      return resp(false, `"${id}" provides core functionality and cannot be disabled.`);
    }

    const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;
    if (!manager.isEnabled(id)) {
      return resp(false, `"${id}" is already disabled.`);
    }

    manager.disable(id);
    return resp(true, `${isPlugin ? 'Plugin' : 'Theme'} "${id}" disabled!`);
  },

  autocomplete (args) {
    const plugins = Array.from(powercord.pluginManager.plugins.values())
      .filter(plugin =>
        !CORE_PLUGINS.includes(plugin) &&
        plugin.entityID !== 'pc-commands' &&
        plugin.entityID.toLowerCase().includes(args[0]?.toLowerCase()) &&
        powercord.pluginManager.isEnabled(plugin.entityID)
      );

    const themes = Array.from(powercord.styleManager.themes.values())
      .filter(theme =>
        theme.entityID.toLowerCase().includes(args[0]?.toLowerCase()) &&
        powercord.styleManager.isEnabled(theme.entityID)
      );

    if (args.length > 1) {
      return false;
    }

    return {
      header: 'replugged entities list',
      commands: [
        ...plugins.map(plugin => ({
          command: plugin.entityID,
          description: `Plugin - ${plugin.manifest.description}`
        })),
        ...themes.map(theme => ({
          command: theme.entityID,
          description: `Theme - ${theme.manifest.description}`
        }))
      ]
    };
  }
};
