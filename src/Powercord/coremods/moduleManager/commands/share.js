const { getModule, i18n: { Messages }, constants: { ComponentActions } } = require('powercord/webpack');
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

function autocompleteFlags (args) {
  const lastArg = args[args.length - 1].toLowerCase();
  if (!lastArg.startsWith('-')) {
    return false;
  }
  const flags = [ '--repo', '--open', '--no-send', '--embed', '--theme', '--plugin' ];
  return {
    commands: flags.filter(flag => flag.startsWith(lastArg) && !args.includes(flag))
      .map(x => ({ command: x })),
    header: 'options list'
  };
}

module.exports = {
  command: 'share',
  description: Messages.REPLUGGED_COMMAND_SHARE_DESC,
  usage: '{c} [ plugin/theme ID]',
  executor ([ id, ...args ]) {
    const isPlugin = args.includes('--plugin') || powercord.pluginManager.plugins.has(id);
    if (!args.includes('--theme') && !args.includes('--plugin')) {
      const isTheme = powercord.styleManager.themes.has(id);

      if (!isPlugin && !isTheme) { // No match
        return resp(false, Messages.REPLUGGED_ERROR_COULD_NOT_FIND_PLUGIN_THEME.format({ id }));
      } else if (isPlugin && isTheme) { // Duplicate name
        return resp(false, Messages.REPLUGGED_COMMAND_SHARE_BOTH_ENTITY.format({ id }));
      }
    }

    const manager = args.includes('--plugin') || isPlugin ? powercord.pluginManager : powercord.styleManager;
    const entity = manager.get(id);
    let url = getWebURL(entity);

    if (url !== '') {
      if (args.includes('--open')) {
        openURL(url);
        return;
      }
      if (!args.includes('--repo')) {
        url = `https://replugged.dev/install?url=${url}`;
      }

      if (!args.includes('--embed')) {
        url = `<${url}>`;
      }

      if (args.includes('--no-send')) {
        appendText(url);
        return;
      }
      return {
        send: true,
        result: url
      };
    }
    return resp(false, Messages.REPLUGGED_COMMAND_SHARE_URL_NOT_FOUND.format({ id }));
  },
  autocomplete ([ id, ...args ]) {
    if (args.length) {
      return autocompleteFlags(args);
    }

    const plugins = Array.from(powercord.pluginManager.plugins.values())
      .filter(plugin => plugin.entityID.toLowerCase().includes(id?.toLowerCase()));

    const themes = Array.from(powercord.styleManager.themes.values())
      .filter(theme => theme.entityID.toLowerCase().includes(id?.toLowerCase()));

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
