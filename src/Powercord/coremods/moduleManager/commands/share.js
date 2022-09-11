const { getModule, i18n: { Messages }, constants: { ComponentActions } } = require('powercord/webpack');
const { ApplicationCommandOptionType } = require('powercord/commands');
const { resp, getWebURL } = require('../util');

const { openURL } = getModule([ 'openURL' ], false);
const { ComponentDispatch } = getModule([ 'ComponentDispatch' ], false);

function appendText (text) {
  ComponentDispatch.dispatchToLastSubscribed(
    ComponentActions.TEXTAREA_FOCUS
  );
  setTimeout(() => {
    ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, {
      plainText: text,
      rawText: text
    });
  }, 0);
}

module.exports = {
  command: 'share',
  description: Messages.REPLUGGED_COMMAND_SHARE_DESC,
  usage: '{c} <plugin/theme ID> [...flags]',
  useNamedSlashArguments: true,
  executor ({ entityid: entityID, type, open, repo, embed, nosend }) {
    const isPlugin = type === 'plugin' || powercord.pluginManager.plugins.has(entityID);
    if (type !== 'theme' && type !== 'plugin') {
      const isTheme = powercord.styleManager.themes.has(entityID);

      if (!isPlugin && !isTheme) { // No match
        return resp(false, Messages.REPLUGGED_ERROR_COULD_NOT_FIND_PLUGIN_THEME.format({ entityID }));
      } else if (isPlugin && isTheme) { // Duplicate name
        return resp(false, Messages.REPLUGGED_COMMAND_SHARE_BOTH_ENTITY.format({ entityID }));
      }
    }

    const manager = type === 'plugin' || isPlugin ? powercord.pluginManager : powercord.styleManager;
    const entity = manager.get(entityID);
    let url = getWebURL(entity);

    if (url !== '') {
      if (open) {
        openURL(url);
        return;
      }
      if (!repo) {
        url = `https://replugged.dev/install?url=${url}`;
      }

      if (!embed) {
        url = `<${url}>`;
      }

      if (nosend) {
        appendText(url);
        return;
      }
      return {
        send: true,
        result: url
      };
    }
    return resp(false, Messages.REPLUGGED_COMMAND_SHARE_URL_NOT_FOUND.format({ entityID }));
  },
  options: [
    {
      name: 'entityid',
      displayName: 'entity',
      description: 'The plugin or theme to share',
      displayDescription: 'The plugin or theme to share',
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
    },
    {
      name: 'type',
      displayName: 'entity_type',
      description: 'plugin or theme',
      displayDescription: 'plugin or theme',
      type: ApplicationCommandOptionType.STRING,
      required: false,
      get choices () {
        return [ 'plugin', 'theme' ].map(e => ({
          name: e,
          displayName: e,
          value: `Entity is a ${e}`
        }));
      }
    },
    {
      name: 'open',
      displayName: 'open_entity_url',
      description: 'opens the url in the browser.',
      displayDescription: 'Opens the url in the browser.',
      type: ApplicationCommandOptionType.BOOLEAN,
      required: false
    },
    {
      name: 'repo',
      displayName: 'repository',
      description: 'sends the github repository link.',
      displayDescription: 'Sends the GitHub repository link.',
      type: ApplicationCommandOptionType.BOOLEAN,
      required: false
    },
    {
      name: 'embed',
      displayName: 'embed',
      description: 'embedify a url when sent.',
      displayDescription: 'Embedify a url when sent.',
      type: ApplicationCommandOptionType.BOOLEAN,
      required: false
    },
    {
      name: 'nosend',
      displayName: 'dont_send',
      description: 'appends the url to message box instead of sending the url.',
      displayDescription: 'Appends the url to message box instead of sending the url.',
      type: ApplicationCommandOptionType.BOOLEAN,
      required: false
    }
  ]
};
