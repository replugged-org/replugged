const { getRepoInfo, cloneRepo, isInstallerURL } = require('../moduleManager/util');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { getModule, React, i18n: { Messages } } = require('powercord/webpack');
const Modal = require('./components/ConfirmModal');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');

const Anchor = getModule(m => m.default?.displayName === 'Anchor', false);
const RPC = getModule([ 'setCommandHandler' ], false);
const { default: RPCError } = getModule(m => m?.default?.prototype?.constructor && m.default?.toString?.().includes('RPCError'), false);
const Socket = getModule([ 'validateSocketClient', 'getVoiceSettings' ], false);
const { RPCErrors } = getModule([ 'RPCErrors' ], false);

function openInstallModal (info) {
  global.DiscordNative.window.focus();

  openModal(() => React.createElement(Modal, {
    type: info.type,
    repoName: info.repoName,
    url: info.url,
    branch: info.branch,
    onConfirm: () => {
      cloneRepo(info.url, powercord, info.type);

      powercord.api.notices.sendToast(`PDPluginInstalling-${info.repoName}`, {
        header: Messages.REPLUGGED_TOAST_INSTALL_HEADER.format({
          name: info.repoName
        }),
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
    onCancel: () => {
      closeModal();
      powercord.api.notices.sendToast(`PDPluginInstallCancelled-${info.repoName}`, {
        header: Messages.REPLUGGED_TOAST_INSTALL_CANCELLED_HEADER.format({
          name: info.repoName
        }),
        type: 'info',
        timeout: 10e3,
        buttons: [ {
          text: Messages.REPLUGGED_BUTTON_GOT_IT,
          color: 'green',
          size: 'medium',
          look: 'outlined'
        } ]
      });
    }
  }));
}
module.exports = async () => {
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
        openInstallModal(info);
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
            header: Messages.REPLUGGED_ERROR_COULD_NOT_FIND_PLUGIN_THEME_AT_REPO.format({
              repoURL
            }),
            type: 'info',
            timeout: 10e3,
            buttons: [ {
              text: Messages.REPLUGGED_BUTTON_GOT_IT,
              color: 'green',
              size: 'medium',
              look: 'outlined'
            } ]
          });
        } else if (info.isInstalled) {
          powercord.api.notices.sendToast(`PDAlreadyInstalled-${info.repoName}`, {
            header: Messages.REPLUGGED_TOAST_PLUGIN_ALREADY_INSTALLED,
            content: Messages.REPLUGGED_ERROR_ALREADY_INSTALLED.format({
              name: info.repoName
            }),
            type: 'info',
            timeout: 10e3,
            buttons: [ {
              text: Messages.REPLUGGED_BUTTON_GOT_IT,
              color: 'green',
              size: 'medium',
              look: 'outlined'
            } ]
          });
        } else {
          openInstallModal(info);
        }
        return info;
      });
    };

    return res;
  });

  Anchor.default.displayName = 'Anchor';

  return () => {
    uninject('installer-open-in-app');
    uninject('installer-rpc-validator');
    delete RPC.commands.PC_INSTALL;
  };
};
