const { getModule, constants: { ComponentActions } } = require('powercord/webpack');
const fs = require('fs');
const path = require('path');
const { resp } = require('../util');

const { openURL } = getModule([ 'openURL' ], false);
const { ComponentDispatch } = getModule([ 'ComponentDispatch' ], false);

function formatUrl (url) {
  return url
    .replace('.git', '')
    .replace('git@github.com:', 'https://github.com/')
    .replace('url = ', '');
}


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
  const flags = [ '--repo', '--no-repo', '--open', '--no-send', '--embed', '--no-embed', '--theme', '--plugin' ];
  return {
    commands: flags.filter(flag => flag.startsWith(lastArg) && !args.includes(flag))
      .map(x => ({ command: x })),
    header: 'options list'
  };
}

module.exports = {
  command: 'share',
  description: 'Share a plugin or theme that you have',
  usage: '{c} [ plugin/theme ID]',
  executor ([ id, ...args ]) {
    const isPlugin = args.includes('--plugin') || powercord.pluginManager.plugins.has(id);
    if (!args.includes('--theme') && !args.includes('--plugin')) {
      const isTheme = powercord.styleManager.themes.has(id);

      if (!isPlugin && !isTheme) { // No match
        return resp(false, `Could not find plugin or theme matching "${id}".`);
      } else if (isPlugin && isTheme) { // Duplicate name
        return resp(false, `"${id}" is in use by both a plugin and theme. You will have to specify with --theme or --plugin flag.`);
      }
    }
    
    const manager = args.includes('--plugin') || isPlugin ? powercord.pluginManager : powercord.styleManager;
    const entity = manager.get(id);
    
    let data = fs.readFileSync(path.resolve(entity.entityPath, '.git', 'config'), 'utf8');
    data = data.split('\n').map(e => e.trim());
    
    let url = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].startsWith('url = ')) {
        url = formatUrl(data[i]);
        break;
      }
    }
    if (url !== '') {
      if (args.includes('--open')) {
        openURL(url);
        return;
      }
      if ((!args.includes('--no-repo')) || args.includes('--repo')) {
        if ((args.includes('--no-embed')) && !args.includes('--embed')) {
          url = `<${url}>`;
        }
      } else {
        url = `<https://replugged.dev/install?url=${url}>`;
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
    return resp(false, 'Unable to find a url in the .git config file');

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
}
