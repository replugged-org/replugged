const { React, getModule, contextMenu } = require('powercord/webpack');
const { PopoutWindow, Tooltip, ContextMenu, Icons: { CodeBraces } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { getOwnerInstance, findInReactTree, waitFor } = require('powercord/util');
const { Plugin } = require('powercord/entities');
const SdkWindow = require('./components/SdkWindow');

module.exports = class SDK extends Plugin {
  async startPlugin () {
    powercord.api.labs.registerExperiment({
      id: 'pc-sdk',
      name: 'Sandbox Development Kit',
      date: 1591011180411,
      description: 'Replugged\'s sandbox development kit for plugin and theme developers',
      callback: () => void 0
    });

    this.popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);

    this.loadStylesheet('scss/style.scss');
    this._addPopoutIcon();
    this.exposeDevShortcuts(this.settings.get('shortcuts', false));
  }

  pluginWillUnload () {
    uninject('pc-sdk-icon');
    powercord.api.labs.unregisterExperiment('pc-sdk');
    this.exposeDevShortcuts(false);
    this.popoutModule.close('DISCORD_REPLUGGED_SANDBOX');
  }

  exposeDevShortcuts (expose = true) {
    if (expose && powercord.api.labs.isExperimentEnabled('pc-sdk')) {
      Object.assign(window, {
        ...require('powercord/webpack'),
        injector: require('powercord/injector'),
        require,
        remount: powercord.pluginManager.remount
      });
    } else {
      delete window.require;
      delete window.injector;
      delete window.remount;
      for (const key in require('powercord/webpack')) {
        delete window[key];
      }
    }
  }

  async _addPopoutIcon () {
    const classes = await getModule([ 'iconWrapper', 'clickable' ]);
    const HeaderBarContainer = await getModule(m => m?.default?.displayName === 'HeaderBar');
    inject('pc-sdk-icon', HeaderBarContainer, 'default', (args, res) => {
      if (powercord.api.labs.isExperimentEnabled('pc-sdk')) {
        const Switcher = React.createElement(Tooltip, {
          text: 'SDK',
          position: 'bottom'
        }, React.createElement('div', {
          className: [ classes.iconWrapper, classes.clickable ].join(' ')
        }, React.createElement(CodeBraces, {
          className: classes.icon,
          onClick: () => this._openSdk(),
          onContextMenu: (e) => {
            contextMenu.openContextMenu(e, () =>
              React.createElement(ContextMenu, {
                width: '50px',
                itemGroups: [ [
                  {
                    type: 'button',
                    name: 'Open Replugged SDK',
                    onClick: () => this._openSdk()
                  },
                  {
                    type: 'button',
                    name: 'Open QuickCSS pop-out',
                    onClick: () => powercord.pluginManager.get('pc-moduleManager')._openQuickCSSPopout()
                  }
                ], [
                  {
                    type: 'button',
                    color: 'colorDanger',
                    name: 'Completely restart Discord',
                    onClick: () => DiscordNative.app.relaunch()
                  }
                ] ]
              })
            );
          }
        })));

        findInReactTree(res, i => i[i.length - 1]?.key === 'members').unshift(Switcher);
      }
      return res;
    });

    const { title } = getModule([ 'title', 'chatContent' ], false);
    getOwnerInstance(await waitFor(`.${title}`)).forceUpdate();
  }

  async _openSdk () {
    this.popoutModule.open('DISCORD_REPLUGGED_SANDBOX', (key) =>
      React.createElement(PopoutWindow, {
        windowKey: key,
        title: 'SDK'
      }, React.createElement(SdkWindow, { exposeDevShortcuts: this.exposeDevShortcuts }))
    );
    this.popoutModule.setAlwaysOnTop('DISCORD_REPLUGGED_SANDBOX', true);
  }
};
