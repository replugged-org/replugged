const { Plugin } = require('powercord/entities');
const { getRepoInfo, cloneRepo } = require('../pc-moduleManager/util');
const express = require('express');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { React, getModule } = require('powercord/webpack');
const Modal = require('./components/ConfirmModal');


module.exports = class RDLinks extends Plugin {
  async startPlugin () {
    this.queue = new Set();
    this.app = express();
    this.showNotification = await getModule([ 'showNotification' ]);
    this.app.get('/', (req, res) => {
      res.send('Rise and shine, Mister Freeman. Rise and... shine. Not that I... wish to imply you have been sleeping on the job. No one is more deserving of a rest... and all the effort in the world would have gone to waste until... well, let\'s just say your hour has... come again. The right man in the wrong place can make all the difference in the world. So, wake up, Mister Freeman. Wake up and... smell the ashes...');
    });

    this.app.get('/install/', (req, res) => {
      this.info = getRepoInfo(req.query.address);
      if (this.info) {
        if (this.info.isInstalled) {
          res.send(`${this.info.type} ${this.info.repoName} is already installed!`);
          return;
        }
        res.send(`Sent prompt to install ${req.query.address}`);
        this.info.url = req.query.address;
        this.openInstallModal();
      } else {
        res.send(`Cannot find repository: ${req.query.address}`);
      }
    });


    this.httpserv = this.app.listen(6473);
  }

  async openInstallModal () {
    await this.showNotification.showNotification('https://cdn.discordapp.com/attachments/1000955992068079716/1001282342641471488/unknown.png', 'Replugged', `Attention required with ${this.info.type} install prompt.`, {
      onClick: () => {
        focus();
      }
    }, {});

    openModal(() => React.createElement(Modal, {
      red: true,
      header: `Install ${this.info.type}`,
      desc: `Are you sure you want to install the ${this.info.type} ${this.info.repoName}?`,
      onConfirm: () => {
        cloneRepo(this.info.url, powercord, this.info.type);

        powercord.api.notices.sendToast(`PDPluginInstalling-${this.info.repoName}`, {
          header: `Installing ${this.info.repoName}...`,
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
        powercord.api.notices.sendToast(`PDPluginInstallCancelled-${this.info.repoName}`, {
          header: `Cancelled ${this.info.repoName} installation`,
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
    this.httpserv.close();
  }
};
