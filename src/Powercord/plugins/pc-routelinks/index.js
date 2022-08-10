const { Plugin } = require('powercord/entities');
const { getRepoInfo, cloneRepo, isInstallerURL } = require('../pc-moduleManager/util');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { getModule, React } = require('powercord/webpack');
const Modal = require('./components/ConfirmModal');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');

const Anchor = getModule(m => m.default?.displayName === 'Anchor', false);
const RPC = getModule([ 'setCommandHandler' ], false);
const { default: RPCError } = getModule(m => m?.default?.prototype?.constructor && m.default?.toString?.().includes('RPCError'), false);
const Socket = getModule([ 'validateSocketClient', 'getVoiceSettings' ], false);
const { RPCErrors } = getModule([ 'RPCErrors' ], false);

module.exports = class RDLinks extends Plugin {
  async startPlugin () {
    const backendURL = powercord.settings.get('backendURL', WEBSITE);

    inject('installer-rpc-validator', Socket, 'validateSocketClient', (args, res) => {
      const [ socket, origin ] = args;
      if (backendURL && origin !== backendURL) {
        return res;
      }

      socket.authorization.scopes.push('PC_BACKEND');

      res.catch(error => void error);
      return Promise.resolve();
    });

    RPC.commands.PC_INSTALL = {
      scope: 'PC_BACKEND',
      handler: async (e) => {
        const { address } = e.args ?? {};
        const info = await getRepoInfo(address);

        if (!info) {
          throw new RPCError(RPCErrors.INVALID_PAYLOAD, 'Could not find repository');
        }
        if (!info.isInstalled) {
          this.openInstallModal(info);
        }
        return info;
      }
    };

    inject('installer-open-in-app', Anchor, 'default', (_, res) => {
      const link = res.props?.href?.toLowerCase();

      if (!link) {
        return res;
      }
      if (!isInstallerURL(link)) {
        return res;
      }

      const url = new URL(link);
      const repoURL = url.searchParams.get('url');

      // Cache info so it's loaded when you click the link
      const repoInfo = Promise.resolve(getRepoInfo(repoURL));

      res.props.onClick = (e) => {
        e.preventDefault();
        repoInfo.then(info => {
          if (!info) {
            powercord.api.notices.sendToast(`PDPluginCannotFind-${repoURL}`, {
              header: `Could not find a plugin or theme repository at ${repoURL}`,
              type: 'info',
              timeout: 10e3,
              buttons: [ {
                text: 'Got It',
                color: 'green',
                size: 'medium',
                look: 'outlined'
              } ]
            });
          } else if (info.isInstalled) {
            powercord.api.notices.sendToast(`PDAlreadyInstalled-${info.repoName}`, {
              header: 'Plugin Already Installed',
              content: `${info.repoName} is already installed.`,
              type: 'info',
              timeout: 10e3,
              buttons: [ {
                text: 'Got It',
                color: 'green',
                size: 'medium',
                look: 'outlined'
              } ]
            });
          } else {
            this.openInstallModal(info);
          }
          return info;
        });
      };

      return res;
    });

    Anchor.default.displayName = 'Anchor';
  }

  openInstallModal (info) {
    global.DiscordNative.window.focus();

    openModal(() => React.createElement(Modal, {
      type: info.type,
      repoName: info.repoName,
      url: info.url,
      branch: info.branch,
      onConfirm: () => {
        cloneRepo(info.url, powercord, info.type);

        powercord.api.notices.sendToast(`PDPluginInstalling-${info.repoName}`, {
          header: `Installing ${info.repoName}...`,
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: 'Got It',
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      },
      onCancel: () => {
        closeModal();
        powercord.api.notices.sendToast(`PDPluginInstallCancelled-${info.repoName}`, {
          header: `Cancelled ${info.repoName} installation`,
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: 'Got It',
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      }
    }));
  }

  async pluginWillUnload () {
    uninject('installer-open-in-app');
    uninject('installer-rpc-validator');
    delete RPC.commands.PC_INSTALL;
  }
};
