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

    const min_port = 6473;
    const max_port = 6480;

    const open = async (port) => new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        this.log(`Listening on port ${port}`);
        resolve(server);
      });

      server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
          this.warn(`Port ${port} is already in use.`);
          if (port >= max_port) {
            this.error('All ports in range are busy, cannot start server.');
          }
          this.log(`Trying port ${port + 1}...`);
          resolve(open(++port));
        }
      });
    });

    this.httpserv = await open(min_port);
  }

  openInstallModal () {
    global.DiscordNative.window.focus();

    openModal(() => React.createElement(Modal, {
      type: this.info.type,
      repoName: this.info.repoName,
      url: this.info.url,
      branch: this.info.branch,
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
