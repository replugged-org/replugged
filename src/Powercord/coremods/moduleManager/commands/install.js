const { cloneRepo, getRepoInfo } = require('../util');
const Modal = require('../components/ConfirmModal');
const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

module.exports = {
  command: 'install',
  description: Messages.REPLUGGED_COMMAND_INSTALL_DESC,
  usage: '{c} [ plugin URL ]',
  async executor (args) {
    let url = args[0];
    if (url) {
      url = url.trim();
    }
    if (url?.match(/^[\w-]+\/[\w-.]+$/)) {
      url = `https://github.com/${url}`;
    }
    try {
      new URL(url);
    } catch (e) {
      return {
        send: false,
        result: Messages.REPLUGGED_COMMAND_INSTALL_ERROR_INVALID_URL
      };
    }

    const info = await getRepoInfo(url);
    if (!info) {
      return {
        send: false,
        result: Messages.REPLUGGED_COMMAND_INSTALL_ERROR_NOT_FOUND
      };
    }

    if (info.isInstalled) {
      return {
        send: false,
        result: Messages.REPLUGGED_ERROR_ALREADY_INSTALLED.format({
          name: info.repoName
        })
      };
    }

    openModal(() => React.createElement(Modal, {
      red: true,
      header: Messages.REPLUGGED_INSTALL_MODAL_HEADER.format({
        type: info.type
      }),
      desc: Messages.REPLUGGED_INSTALL_MODAL_DESC.format({
        type: info.type,
        name: info.repoName
      }),
      onConfirm: () => {
        cloneRepo(url, powercord, info.type);

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
      onCancel: () => closeModal()
    }));
  }
};

