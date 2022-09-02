const { loadStyle } = require('../util');

const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs').promises;
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { PopoutWindow } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, forceUpdateElement } = require('powercord/util');
const { SpecialChannels: { CSS_SNIPPETS, STORE_PLUGINS, STORE_THEMES }, WEBSITE } = require('powercord/constants');
const { join } = require('path');
const commands = require('./commands');
const deeplinks = require('./deeplinks');
const i18n = require('./licenses/index');

const Plugins = require('./components/manage/Plugins');
const Themes = require('./components/manage/Themes');
const QuickCSS = require('./components/manage/QuickCSS');
const SnippetButton = require('./components/SnippetButton');
const InstallerButton = require('./components/installer/Button');
const { cloneRepo, getRepoInfo } = require('./util');
const { injectContextMenu } = require('powercord/util');

const Menu = getModule([ 'MenuItem' ], false);

let _quickCSS = '';
const _quickCSSFile = join(__dirname, '..', '..', '..', '..', 'settings', 'quickcss', 'main.css');
let _quickCSSElement;

async function _installerInjectCtxMenu () {
  injectContextMenu('pc-installer-ctx-menu', 'MessageContextMenu', ([ { target } ], res) => {
    if (!target || !target?.href || !target?.tagName || target.tagName.toLowerCase() !== 'a') {
      return res;
    }

    const info = getRepoInfo(target.href);
    if (info instanceof Promise) {
      info.then(() => forceUpdateElement('#message'));
    } else if (info) {
      const { type, isInstalled, url } = info;

      const label = type === 'plugin' ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME;

      if (isInstalled) {
        res.props.children.splice(
          4,
          0,
          React.createElement(Menu.MenuItem, {
            name: Messages.REPLUGGED_INSTALLED_PLUGIN_THEME.format({
              name: label
            }),
            seperate: true,
            id: 'InstallerContextLink',
            label: Messages.REPLUGGED_INSTALLED_PLUGIN_THEME.format({
              name: label
            }),
            action: () => console.log('lol what it\'s already installed idiot')
          })
        );
      } else {
        res.props.children.splice(
          4,
          0,
          React.createElement(Menu.MenuItem, {
            name: Messages.REPLUGGED_MODULE_MANAGER_INSTALL_LABEL.format({
              type: label
            }),
            seperate: true,
            id: 'InstallerContextLink',
            label: Messages.REPLUGGED_MODULE_MANAGER_INSTALL_LABEL.format({
              type: label
            }),
            action: () => cloneRepo(url, powercord, type)
          })
        );
      }
    }

    return res;
  });
}

async function _injectSnippets () {
  const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');
  inject('pc-moduleManager-snippets', MiniPopover, 'default', (args, res) => {
    const props = findInReactTree(res, r => r && r.message && r.setPopout);
    if (!props || !CSS_SNIPPETS.includes(props.channel.id)) {
      return res;
    }

    res.props.children.unshift(
      React.createElement(SnippetButton, {
        message: props.message
      })
    );
    return res;
  });
  MiniPopover.default.displayName = 'MiniPopover';
}

async function _saveQuickCSS (css, apply = true) {
  if (apply) {
    // Recursive call
    // eslint-disable-next-line no-use-before-define
    await _applyQuickCSS(css, false);
  }
  await writeFile(_quickCSSFile, _quickCSS);
}

async function _applyQuickCSS (css, save = false) {
  _quickCSS = css.trim();
  powercord.api.moduleManager._quickCSS = _quickCSS;
  _quickCSSElement.innerHTML = _quickCSS;
  if (save) {
    await _saveQuickCSS(null, false);
  }
}

async function _applySnippet (message) {
  let css = '\n\n/**\n';
  const line1 = Messages.REPLUGGED_SNIPPET_LINE1.format({ date: new Date() });
  const line2 = Messages.REPLUGGED_SNIPPET_LINE2.format({
    authorTag: message.author.tag,
    authorId: message.author.id
  });
  css += ` * ${line1}\n`;
  css += ` * ${line2}\n`;
  css += ` * Snippet ID: ${message.id}\n`;
  css += ' */\n';
  for (const m of message.content.matchAll(/```((?:s?css)|(?:styl(?:us)?)|less)\n?([\s\S]*)`{3}/ig)) {
    let snippet = m[2].trim();
    switch (m[1].toLowerCase()) {
      case 'scss':
        snippet = '/* lol can\'t do scss for now */';
        break;
      case 'styl':
      case 'stylus':
        snippet = '/* lol can\'t do stylus for now */';
        break;
      case 'less':
        snippet = '/* lol can\'t do less for now */';
        break;
    }
    css += `${snippet}\n`;
    css += `/** ${message.id} */\n`;
  }
  _applyQuickCSS(_quickCSS + css, true);
}

async function _fetchEntities (type) {
  powercord.api.notices.closeToast('missing-entities-notify');

  const entityManager = powercord[type === 'plugins' ? 'pluginManager' : 'styleManager'];
  const missingEntities = await type === 'plugins' ? entityManager.startPlugins(true) : entityManager.loadThemes(true);
  const entity = missingEntities.length === 1 ? type.slice(0, -1) : type;
  const subjectiveEntity = `${entity} ${entity === type ? 'were' : 'was'}`;

  let props;
  if (missingEntities.length > 0) {
    props = {
      header: Messages.REPLUGGED_MODULE_MANAGER_FOUND_MISSING.format({
        missingCount: missingEntities.length,
        type: entity
      }),
      content: React.createElement('div', null,
        Messages.REPLUGGED_MODULE_MANAGER_MISSING_RETRIEVED.format({
          type: subjectiveEntity
        }),
        React.createElement('ul', null, missingEntities.map(entity =>
          React.createElement('li', null, `– ${entity}`))
        )
      ),
      buttons: [ {
        text: Messages.REPLUGGED_OK,
        color: 'green',
        look: 'outlined'
      } ],
      type: 'success'
    };
  } else {
    props = {
      header: Messages.REPLUGGED_MODULE_MANAGER_NO_MISSING.format({
        type
      }),
      type: 'danger',
      timeout: 10e3
    };
  }

  powercord.api.notices.sendToast('missing-entities-notify', props);
}

async function _loadQuickCSS () {
  _quickCSSElement = document.createElement('style');
  _quickCSSElement.id = 'powercord-quickcss';
  document.head.appendChild(_quickCSSElement);
  if (existsSync(_quickCSSFile)) {
    const settings = powercord.api.settings.buildCategoryObject('pc-moduleManager');
    _quickCSS = await readFile(_quickCSSFile, 'utf8');
    powercord.api.moduleManager._quickCSS = _quickCSS;
    if (settings.get('qcss-enabled', true)) {
      _quickCSSElement.innerHTML = _quickCSS;
    }
  }
  powercord.api.moduleManager._quickCSSElement = _quickCSSElement;
}

async function _clearQuickCSSElement () {
  _quickCSSElement.innerHTML = '';
}

async function _openQuickCSSPopout () {
  const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
  popoutModule.open('DISCORD_POWERCORD_QUICKCSS', (key) => (
    React.createElement(PopoutWindow, {
      windowKey: key,
      title: 'QuickCSS'
    }, React.createElement(QuickCSS, { popout: true }))
  ));
}

async function _installerInjectPopover () {
  const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');
  inject('pc-installer-popover', MiniPopover, 'default', (args, res) => {
    const props = findInReactTree(res, r => r && r.message && r.setPopout);
    if (!props || ![ ...STORE_THEMES, ...STORE_PLUGINS ].includes(props.channel?.id)) {
      return res;
    }
    res.props.children.unshift(
      React.createElement(InstallerButton, {
        message: props.message,
        _applySnippet,
        _quickCSS,
        type: STORE_THEMES.includes(props.channel.id) ? 'theme' : 'plugin'
      })
    );
    return res;
  });
  MiniPopover.default.displayName = 'MiniPopover';
}


module.exports = async () => {
  powercord.api.moduleManager = {
    _applyQuickCSS,
    _applySnippet,
    _fetchEntities,
    _clearQuickCSSElement,
    _quickCSS,
    _quickCSSFile,
    _quickCSSElement
  };

  // this is for the new api
  const currentAPI = powercord.settings.get('backendURL', WEBSITE);
  if (currentAPI === 'https://powercord.dev') {
    powercord.settings.set('backendURL', WEBSITE); // change it to replugged.dev
  }

  powercord.api.i18n.loadAllStrings(i18n);
  Object.values(commands).forEach(cmd => powercord.api.commands.registerCommand(cmd));

  await _loadQuickCSS();
  await _injectSnippets();
  await _installerInjectPopover();
  await _installerInjectCtxMenu();
  loadStyle(join(__dirname, 'scss/style.scss'));
  powercord.api.settings.registerSettings('pc-moduleManager-plugins', {
    category: 'moduleManager',
    label: () => Messages.REPLUGGED_PLUGINS,
    render: Plugins
  });
  powercord.api.settings.registerSettings('pc-moduleManager-themes', {
    category: 'moduleManager',
    label: () => Messages.REPLUGGED_THEMES,
    render: (props) => React.createElement(Themes, {
      openPopout: () => _openQuickCSSPopout(),
      ...props
    })
  });
  powercord.api.settings.registerSettings('pc-moduleManager-css', {
    category: 'moduleManager',
    label: () => Messages.REPLUGGED_QUICKCSS,
    render: (props) => React.createElement(QuickCSS, {
      openPopout: () => _openQuickCSSPopout(),
      ...props
    })
  });

  if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-deeplinks')) {
    deeplinks();
  }

  return () => {
    document.querySelector('#powercord-quickcss')?.remove();
    powercord.api.settings.unregisterSettings('pc-moduleManager-plugins');
    powercord.api.settings.unregisterSettings('pc-moduleManager-themes');
    powercord.api.settings.unregisterSettings('pc-moduleManager-css');
    powercord.api.labs.unregisterExperiment('pc-moduleManager-themes2');
    powercord.api.labs.unregisterExperiment('pc-moduleManager-deeplinks');
    Object.values(commands).forEach(cmd => powercord.api.commands.unregisterCommand(cmd.command));
    uninject('pc-moduleManager-snippets');
    uninject('pc-installer-popover');
    uninject('pc-installer-ctx-menu');
    uninject('pc-installer-lazy-contextmenu');
    document.querySelectorAll('.powercord-snippet-apply').forEach(e => e.style.display = 'none');

    delete powercord.api.moduleManager;
  };
};
