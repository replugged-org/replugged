const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs').promises;
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { PopoutWindow } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, forceUpdateElement } = require('powercord/util');
const { Plugin } = require('powercord/entities');
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

// @todo: give a look to why quickcss.css file shits itself
module.exports = class ModuleManager extends Plugin {
  async startPlugin () {
    // this is for the new api
    const currentAPI = powercord.settings.get('backendURL', WEBSITE);
    if (currentAPI === 'https://powercord.dev') {
      powercord.settings.set('backendURL', WEBSITE); // change it to replugged.dev
    }

    powercord.api.i18n.loadAllStrings(i18n);
    Object.values(commands).forEach(cmd => powercord.api.commands.registerCommand(cmd));
    this.Menu = getModule([ 'MenuItem' ], false);

    powercord.api.labs.registerExperiment({
      id: 'pc-moduleManager-themes2',
      name: 'New themes features',
      date: 1587857509321,
      description: 'New Theme management UI & settings',
      /* lexisother: Hi developer! Did you fix this experiment? Please remove the `broken` object! Thanks <3 */
      broken: {
        reason: 'there is no code related to this experiment'
      },
      callback: () => {
        // We're supposed to do it properly but reload > all
        setImmediate(() => powercord.pluginManager.remount(this.entityID));
        // And we wrap it in setImmediate to not break the labs UI
      }
    });

    powercord.api.labs.registerExperiment({
      id: 'pc-moduleManager-deeplinks',
      name: 'Deeplinks',
      date: 1590242558077,
      description: 'Makes some replugged.dev links trigger in-app navigation, as well as some potential embedding if applicable',
      /* lexisother: Hi developer! Did you fix this experiment? Please remove the `broken` object! Thanks <3 */
      broken: {
        reason: 'the deeplinks module is empty'
      },
      callback: () => {
        // We're supposed to do it properly but reload > all
        setImmediate(() => powercord.pluginManager.remount(this.entityID));
        // And we wrap it in setImmediate to not break the labs UI
      }
    });

    this._quickCSS = '';
    this._quickCSSFile = join(__dirname, 'quickcss.css');
    this._loadQuickCSS();
    this._injectSnippets();
    await this._installerInjectPopover();
    await this._installerInjectCtxMenu();
    this.loadStylesheet('scss/style.scss');
    powercord.api.settings.registerSettings('pc-moduleManager-plugins', {
      category: this.entityID,
      label: () => Messages.REPLUGGED_PLUGINS,
      render: Plugins
    });
    powercord.api.settings.registerSettings('pc-moduleManager-themes', {
      category: this.entityID,
      label: () => Messages.REPLUGGED_THEMES,
      render: (props) => React.createElement(Themes, {
        openPopout: () => this._openQuickCSSPopout(),
        ...props
      })
    });
    powercord.api.settings.registerSettings('pc-moduleManager-css', {
      category: this.entityID,
      label: () => Messages.REPLUGGED_QUICKCSS,
      render: (props) => React.createElement(QuickCSS, {
        openPopout: () => this._openQuickCSSPopout(),
        ...props
      })
    });

    if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-deeplinks')) {
      deeplinks();
    }
  }

  pluginWillUnload () {
    document.querySelector('#powercord-quickcss').remove();
    powercord.api.settings.unregisterSettings('pc-moduleManager-plugins');
    powercord.api.settings.unregisterSettings('pc-moduleManager-themes');
    powercord.api.labs.unregisterExperiment('pc-moduleManager-themes2');
    powercord.api.labs.unregisterExperiment('pc-moduleManager-deeplinks');
    Object.values(commands).forEach(cmd => powercord.api.commands.unregisterCommand(cmd.command));
    uninject('pc-moduleManager-snippets');
    uninject('pc-installer-popover');
    uninject('pc-installer-ctx-menu');
    uninject('pc-installer-lazy-contextmenu');
    document.querySelectorAll('.powercord-snippet-apply').forEach(e => e.style.display = 'none');
  }

  async _installerInjectPopover () {
    const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');
    inject('pc-installer-popover', MiniPopover, 'default', (args, res) => {
      const props = findInReactTree(res, r => r && r.message && r.setPopout);
      if (!props || ![ ...STORE_THEMES, ...STORE_PLUGINS ].includes(props.channel?.id)) {
        return res;
      }
      this.log('Popover injected');
      res.props.children.unshift(
        React.createElement(InstallerButton, {
          message: props.message,
          main: this,
          type: STORE_THEMES.includes(props.channel.id) ? 'theme' : 'plugin'
        })
      );
      return res;
    });
    MiniPopover.default.displayName = 'MiniPopover';
  }

  async _installerInjectCtxMenu () {
    injectContextMenu('pc-installer-ctx-menu', 'MessageContextMenu', ([ { target } ], res) => {
      if (!target || !target?.href || !target?.tagName || target.tagName.toLowerCase() !== 'a') {
        return res;
      }

      const info = getRepoInfo(target.href);
      if (info instanceof Promise) {
        info.then(() => forceUpdateElement('#message'));
      } else if (info) {
        const { type, isInstalled } = info;

        const label = type === 'plugin' ? 'Plugin' : 'Theme';

        if (isInstalled) {
          res.props.children.splice(
            4,
            0,
            React.createElement(this.Menu.MenuItem, {
              name: `${label} Installed`,
              seperate: true,
              id: 'InstallerContextLink',
              label: `${label} Installed`,
              action: () => console.log('lol what it\'s already installed idiot')
            })
          );
        } else {
          res.props.children.splice(
            4,
            0,
            React.createElement(this.Menu.MenuItem, {
              name: `Install ${label}`,
              seperate: true,
              id: 'InstallerContextLink',
              label: `Install ${label}`,
              action: () => cloneRepo(target.href, powercord, type)
            })
          );
        }
      }

      return res;
    });
  }

  async _injectSnippets () {
    const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');
    inject('pc-moduleManager-snippets', MiniPopover, 'default', (args, res) => {
      const props = findInReactTree(res, r => r && r.message && r.setPopout);
      if (!props || !CSS_SNIPPETS.includes(props.channel.id)) {
        return res;
      }

      res.props.children.unshift(
        React.createElement(SnippetButton, {
          message: props.message,
          main: this
        })
      );
      return res;
    });
    MiniPopover.default.displayName = 'MiniPopover';
  }

  async _applySnippet (message) {
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
    this._applyQuickCSS(this._quickCSS + css, true);
  }

  async _fetchEntities (type) {
    powercord.api.notices.closeToast('missing-entities-notify');

    const entityManager = powercord[type === 'plugins' ? 'pluginManager' : 'styleManager'];
    const missingEntities = await type === 'plugins' ? entityManager.startPlugins(true) : entityManager.loadThemes(true);
    const entity = missingEntities.length === 1 ? type.slice(0, -1) : type;
    const subjectiveEntity = `${entity} ${entity === type ? 'were' : 'was'}`;

    let props;
    if (missingEntities.length > 0) {
      props = {
        header: `Found ${missingEntities.length} missing ${entity}!`,
        content: React.createElement('div', null,
          `The following ${subjectiveEntity} retrieved:`,
          React.createElement('ul', null, missingEntities.map(entity =>
            React.createElement('li', null, `– ${entity}`))
          )
        ),
        buttons: [ {
          text: 'OK',
          color: 'green',
          look: 'outlined'
        } ],
        type: 'success'
      };
    } else {
      props = {
        header: `No missing ${type} were found - try again later!`,
        type: 'danger',
        timeout: 10e3
      };
    }

    powercord.api.notices.sendToast('missing-entities-notify', props);
  }

  async _loadQuickCSS () {
    this._quickCSSElement = document.createElement('style');
    this._quickCSSElement.id = 'powercord-quickcss';
    document.head.appendChild(this._quickCSSElement);
    if (existsSync(this._quickCSSFile)) {
      this._quickCSS = await readFile(this._quickCSSFile, 'utf8');
      if (this.settings.get('qcss-enabled', true)) {
        this._quickCSSElement.innerHTML = this._quickCSS;
      }
    }
  }

  async _applyQuickCSS (css, save = false) {
    this._quickCSS = css.trim();
    this._quickCSSElement.innerHTML = this._quickCSS;
    if (save) {
      await writeFile(this._quickCSSFile, this._quickCSS);
    }
  }

  async _clearQuickCSSElement () {
    this._quickCSSElement.innerHTML = '';
  }

  async _openQuickCSSPopout () {
    const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
    popoutModule.open('DISCORD_POWERCORD_QUICKCSS', (key) => (
      React.createElement(PopoutWindow, {
        windowKey: key,
        title: 'QuickCSS'
      }, React.createElement(QuickCSS, { popout: true }))
    ));
  }
};
