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
    this.focus = await getModule([ 'focus' ]);

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'POST');
      next();
    });

    this.app.post('/', (req, res) => {
      if (req.header.origin === 'replugged.dev') {
        res.sendStatus(400);
      }
      // res.sendStatus(400); for debug only, commented out so no good reply is sent in case of bad origin
    });

    this.app.post('/install/', async (req, res) => {
      if (req.header.origin !== 'replugged.dev') {
        return;
      }
      this.info = await getRepoInfo(req.query.address);
      if (this.info) {
        if (this.info.isInstalled) {
          res.status(403).json({ error: 'Already installed',
            installed: true,
            promptSent: false,
            cannotFind: false
          });
          return;
        }
        res.status(200).json({ error: 'Success',
          installed: false,
          promptSent: true,
          cannotFind: false
        });
        this.info.url = req.query.address;
        this.openInstallModal();
      } else {
        res.status(404).json({ error: 'Cannot find repository',
          installed: false,
          promptSent: false,
          cannotFind: true
        });
      }
    });


    this.httpserv = this.app.listen(6473);
  }

  openInstallModal () {
    this.showNotification.showNotification('https://cdn.discordapp.com/attachments/1000955992068079716/1001282342641471488/unknown.png', 'Replugged', `Attention required with ${this.info.type} install prompt.`, {
      onClick: () => {
        global.DiscordNative.window.focus();
      }
    }, {});

    openModal(() => React.createElement(Modal, {
      red: true,
      header: `Install ${this.info.type}`,
      desc: `Are you sure you want to install the ${this.info.type} ${this.info.repoName} (from ${this.info.url}?`,
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
