const { Plugin } = require('powercord/entities');
const { getRepoInfo, cloneRepo } = require('../pc-moduleManager/util');
const express = require('express');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { getModule, React } = require('powercord/webpack');
const Modal = require('./components/ConfirmModal');
const { inject, uninject } = require('powercord/injector');

const Anchor = getModule(m => m.default?.displayName === 'Anchor', false);

module.exports = class RDLinks extends Plugin {
  async handleRequest (address) {
    this.info = await getRepoInfo(address);
    if (this.info) {
      this.info.url = address;
      if (this.info.isInstalled) {
        return ({
          code: 'ALREADY-INSTALLED',
          info: this.info
        });
      }

      return ({
        code: 'SUCCESS',
        info: this.info
      });
    }
    return ({
      code: 'CANNOT-FIND'
    });
  }

  async startPlugin () {
    this.app = express();

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'https://replugged.dev');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'POST');
      next();
    });

    this.app.post('/install/', async (req, res) => {
      const data = await this.handleRequest(req.query.address);
      this.info = data.info;
      if (data.code === 'SUCCESS') {
        this.openInstallModal();
      }
      res.status(200).json(data);
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


    inject('installer-open-in-app', Anchor, 'default', (_, res) => {
      const link = res.props?.href?.toLowerCase();

      if (link) {
        const match = (/^https?:\/\/(?:www\.)?replugged\.dev\/install\?url=(.*)$/).exec(link);
        if (match) {
          let url = decodeURIComponent(match[1]);
          if (url.match(/^[\w-]+\/[\w-.]+$/)) {
            url = `https://github.com/${url}`;
          }

          // Cache info so it's loaded when you click the link
          getRepoInfo(url);

          res.props.onClick = (e) => {
            e.preventDefault();
            this.handleRequest(url).then(data => {
              this.info = data.info;
              if (data.code === 'SUCCESS') {
                this.openInstallModal();
              }
              if (data.code === 'ALREADY-INSTALLED') {
                powercord.api.notices.sendToast(`PDPluginAlreadyInstalled-${this.info.repoName}`, {
                  header: `The ${this.info.type} ${this.info.repoName} is already installed.`,
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
              if (data.code === 'CANNOT-FIND') {
                powercord.api.notices.sendToast(`PDPluginCannotFind-${url}`, {
                  header: `Could not find a plugin or theme repository at ${url}`,
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
            });
          };
        }
      }

      return res;
    });

    Anchor.default.displayName = 'Anchor';
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
    uninject('installer-open-in-app');
  }
};
