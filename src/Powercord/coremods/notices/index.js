const { loadStyle } = require('../util');

const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { unlink } = require('fs').promises;
const { React, getModule, getModuleByDisplayName, constants: { Routes } } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor, findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { GUILD_ID, DISCORD_INVITE } = require('powercord/constants');

const ToastContainer = require('./components/ToastContainer');
const AnnouncementContainer = require('./components/AnnouncementContainer');

async function _patchAnnouncements () {
  const { base } = await getModule([ 'base', 'container' ]);
  const instance = getOwnerInstance(await waitFor(`.${base.split(' ')[0]}`));
  inject('pc-notices-announcements', instance.props.children[0], 'type', (_, res) => {
    const { children } = findInReactTree(res, ({ className }) => className === base);
    children.unshift(React.createElement(AnnouncementContainer));
    return res;
  });

  powercord.api.notices.once('announcementAdded', () => {
    forceUpdateElement(`.${base}`);
  });
}

async function _patchToasts () {
  const { app } = await getModule([ 'app', 'layers' ]);
  const Shakeable = await getModuleByDisplayName('Shakeable');
  inject('pc-notices-toast', Shakeable.prototype, 'render', (_, res) => {
    if (!res.props.children.find(child => child.type && child.type.name === 'ToastContainer')) {
      res.props.children.push(React.createElement(ToastContainer));
    }
    return res;
  });
  forceUpdateElement(`.${app}`);
}

function _welcomeNewUser () {
  powercord.api.notices.sendAnnouncement('pc-first-welcome', {
    color: 'green',
    message: 'Welcome! Replugged has been successfully injected into your Discord client. Feel free to join our Discord server for announcements, support and more!',
    button: {
      text: 'Join Server',
      onClick: async () => {
        const store = await getModule([ 'getGuilds' ]);
        if (store.getGuilds()[GUILD_ID]) {
          const channel = await getModule([ 'getLastSelectedChannelId' ]);
          const router = await getModule([ 'transitionTo' ]);
          // eslint-disable-next-line new-cap
          router.transitionTo(Routes.CHANNEL(GUILD_ID, channel.getChannelId(GUILD_ID)));
        } else {
          const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
          const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
          const oldMinimize = windowManager.minimize;
          windowManager.minimize = () => void 0;
          popInvite({ args: { code: DISCORD_INVITE } });
          windowManager.minimize = oldMinimize;
        }
      }
    }
  });
}

module.exports = async () => {
  loadStyle(join(__dirname, 'style.scss'));

  _patchAnnouncements();
  _patchToasts();

  const injectedFile = resolve(__dirname, '..', '..', '..', '__injected.txt');
  if (existsSync(injectedFile)) {
    const connection = await getModule([ 'isTryingToConnect', 'isConnected' ]);
    const connectedListener = async () => {
      if (!connection.isConnected()) {
        return;
      }
      connection.removeChangeListener(connectedListener);

      // Run once discord is started:
      /* Check if user is in the replugged guild. Only show new
           user banner if they aren't already in the discord server. */
      const guildStore = await getModule([ 'getGuilds' ]);
      if (!guildStore.getGuilds()[GUILD_ID]) {
        _welcomeNewUser();
      }
    };

    if (connection.isConnected()) {
      connectedListener();
    } else {
      connection.addChangeListener(connectedListener);
    }

    unlink(injectedFile);
  }

  return () => {
    uninject('pc-notices-announcements');
    uninject('pc-notices-toast');
  };
};
