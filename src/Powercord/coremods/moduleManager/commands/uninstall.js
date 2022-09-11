const Modal = require('../components/ConfirmModal');
const { ApplicationCommandOptionType } = require('powercord/commands');
const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

const { resp } = require('../util');

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

    const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;


    openModal(() => React.createElement(Modal, {
      red: true,
      header: Messages.REPLUGGED_COMMAND_UNINSTALL_MODAL_HEADER.format({ id }),
      desc: Messages.REPLUGGED_COMMAND_UNINSTALL_MODAL_DESC.format({ id }),
      onConfirm: () => {
        manager.uninstall(id);

        powercord.api.notices.sendToast(`PDPluginUninstalled-${id}`, {
          header: Messages.REPLUGGED_COMMAND_UNINSTALL_TOAST_HEADER.format({
            type: isPlugin ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME
          }),
          content: Messages.REPLUGGED_COMMAND_UNINSTALL_TOAST_CONTENT.format({ id }),
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: Messages.REPLUGGED_BUTTON_GOT_IT,
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      },
      onCancel: () => closeModal()
    }));
  },
  options: [
    {
      name: 'entity',
      displayName: 'entity',
      description: 'the plugin or theme to uninstall',
      displayDescription: 'The plugin or theme to uninstall',
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
