const { Plugin } = require('powercord/entities');
const { getRepoInfo, cloneRepo } = require('../pc-moduleManager/util');
const express = require('express');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { React } = require('powercord/webpack');
const Modal = require('./components/ConfirmModal');


module.exports = class RDLinks extends Plugin {
  async startPlugin () {
    this.app = express();

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'https://replugged.dev');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'POST');
      next();
    });

    this.app.post('/install/', async (req, res) => {
      this.info = await getRepoInfo(req.query.address);
      if (this.info) {
        if (this.info.isInstalled) {
          res.status(403).json({ error: 'ALREADY-INSTALLED',
            plainText: `${this.info.repoName} is already installed.`
          });
          return;
        }
        // eslint-disable-next-line no-warning-comments
        // TODO QUEUE
        res.status(200).json({ error: 'SUCCESS',
          plainText: `Successfully sent prompt for ${this.info.repoName} install.`
        });
        this.info.url = req.query.address;
        this.openInstallModal();
      } else {
        res.status(404).json({ error: 'CANNOT-FIND',
          plainText: `Cannot find ${req.query.address}.`
        });
      }
    });


    this.httpserv = this.app.listen(6473);
  }

  openInstallModal () {
    global.DiscordNative.window.focus();

    openModal(() => React.createElement(Modal, {
      red: true,
      header: `Install ${this.info.type}`,
      desc: `Are you sure you want to install the ${this.info.type} ${this.info.repoName} from ?`,
      url: this.info.url
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
