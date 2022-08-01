const { Plugin } = require('powercord/entities');
const { getRepoInfo, cloneRepo } = require('../pc-moduleManager/util');
const express = require('express');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { React, getModule } = require('powercord/webpack');
const Modal = require('../pc-moduleManager/components/ConfirmModal');
const app = express();
let httpserv;

async function openInstallModal (info) {
  const BOT_AVATARS = await getModule([ 'BOT_AVATARS' ]);
  const showNotification = await getModule([ 'showNotification' ]);

  showNotification.showNotification(BOT_AVATARS.replugged, 'Replugged', `Attention required with ${info.type} install prompt.`, { onClick: () => {
    focus();
  } }, {});

  openModal(() => React.createElement(Modal, {
    red: true,
    header: `Install ${info.type}`,
    desc: `Are you sure you want to install the ${info.type} ${info.repoName}?`,
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

module.exports = class RDLinks extends Plugin {
  async startPlugin () {
    app.get('/', (req, res) => {
      res.send('You are not supposed to be here.');
    });

    app.get('/install/', (req, res) => {
      console.log(req.query);
      res.send(`Sent prompt to install ${req.query.address}`);
      const info = getRepoInfo(req.query.address);
      if (info) {
        info.url = req.query.address;
        openInstallModal(info);
      }
    });


    httpserv = app.listen(6473);
  }

  async pluginWillUnload () {
    httpserv.close();
  }
};
