const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { Plugin } = require('powercord/entities');

const { join } = require('path');

const Settings = require('./components/Settings.jsx');

const changelog = require('../../../../changelogs.json');

module.exports = class Updater extends Plugin {
  constructor () {
    super();

    this.checking = false;
    this.cwd = { cwd: join(__dirname, ...Array(4).fill('..')) };
  }

  async startPlugin () {
    this.settings.set('paused', false);
    this.settings.set('failed', false);
    this.settings.set('checking', false);
    this.settings.set('updating', false);
    this.settings.set('awaiting_reload', false);
    this.settings.set('checking_progress', null);

    this.loadStylesheet('style.scss');
    powercord.api.settings.registerSettings('pc-updater', {
      category: this.entityID,
      label: 'Updater', // Note to self: add this string to i18n last :^)
      render: Settings
    });

    let minutes = Number(this.settings.get('interval', 15));
    if (minutes < 1) {
      this.settings.set('interval', 1);
      minutes = 1;
    }

    this._interval = setInterval(this.checkForUpdates.bind(this), minutes * 60 * 1000);
    setTimeout(() => {
      this.checkForUpdates();
    }, 10e3);

    const lastChangelog = this.settings.get('last_changelog', '');
    if (changelog.id !== lastChangelog) {
      this.openChangeLogs();
    }
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('pc-updater');
    clearInterval(this._interval);
  }

  async checkForUpdates (allConcurrent = false) {
    if (
      this.settings.get('disabled', false) ||
      this.settings.get('paused', false) ||
      this.settings.get('checking', false) ||
      this.settings.get('updating', false)
    ) {
      return;
    }

    this.settings.set('checking', true);
    this.settings.set('checking_progress', [ 0, 0 ]);
    const disabled = this.settings.get('entities_disabled', []).map(e => e.id);
    const skipped = this.settings.get('entities_skipped', []);
    const plugins = [ ...powercord.pluginManager.plugins.values() ].filter(p => !p.isInternal);
    const themes = [ ...powercord.styleManager.themes.values() ];

    const entities = plugins.concat(themes).filter(e => !disabled.includes(e.updateIdentifier) && e.isUpdatable());
    if (!disabled.includes(powercord.updateIdentifier)) {
      entities.push(powercord);
    }

    let done = 0;
    const updates = [];
    const entitiesLength = entities.length;
    const parallel = allConcurrent ? entitiesLength : this.settings.get('concurrency', 2);
    await Promise.all(Array(parallel).fill(null).map(async () => {
      let entity;
      while ((entity = entities.shift())) {
        try {
          const repo = await entity.getGitRepo();
          if (repo) {
            const shouldUpdate = await entity._checkForUpdates();
            if (shouldUpdate) {
              const commits = await entity._getUpdateCommits();
              if (commits[0] && skipped[entity.updateIdentifier] === commits[0].id) {
                continue;
              }
              updates.push({
                id: entity.updateIdentifier,
                name: entity.manifest?.name ?? 'Replugged',
                icon: entity.constructor.name === 'Theme' || entity.constructor.name === 'Replugged'
                  ? entity.constructor.name
                  : 'Plugin',
                commits,
                repo
              });
            }
          }
        } catch (e) {
          console.error('An error occurred while checking for updates for %s', entity.manifest?.name ?? 'Replugged', e);
        } finally {
          this.settings.set('checking_progress', [ ++done, entitiesLength ]);
        }
      }
    }));

    this.settings.set('updates', updates);
    this.settings.set('last_check', Date.now());
    this.settings.set('checking', false);
    if (updates.length > 0) {
      if (this.settings.get('automatic', false)) {
        this.doUpdate();
      } else if (this.settings.get('toastenabled', true) && !document.querySelector('#powercord-updater, .powercord-updater')) {
        powercord.api.notices.sendToast('powercord-updater', {
          header: Messages.REPLUGGED_UPDATES_TOAST_AVAILABLE_HEADER,
          content: Messages.REPLUGGED_UPDATES_TOAST_AVAILABLE_DESC,
          icon: 'wrench',
          buttons: [ {
            text: Messages.REPLUGGED_UPDATES_UPDATE,
            color: 'green',
            look: 'outlined',
            onClick: () => this.doUpdate()
          }, {
            text: Messages.REPLUGGED_UPDATES_OPEN_UPDATER,
            color: 'blue',
            look: 'ghost',
            onClick: async () => {
              const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
              settingsModule.open('pc-updater');
            }
          } ]
        });
      }
    }
  }

  async doUpdate (force = false) {
    this.settings.set('failed', false);
    this.settings.set('updating', true);
    const updates = this.settings.get('updates', []);
    const failed = [];
    for (const update of [ ...updates ]) {
      let entity = powercord;
      if (update.id.startsWith('plugin')) {
        entity = powercord.pluginManager.get(update.id.replace('plugins_', ''));
      } else if (update.id.startsWith('theme')) {
        entity = powercord.styleManager.get(update.id.replace('themes_', ''));
      }

      const success = await entity._update(force);
      updates.shift();
      this.settings.get('updates', updates);
      if (!success) {
        failed.push(update);
      }
    }

    this.settings.set('updating', false);
    if (failed.length > 0) {
      this.settings.set('failed', true);
      this.settings.set('updates', failed);
      if (this.settings.get('toastenabled', true) && !document.querySelector('#powercord-updater, .powercord-updater')) {
        powercord.api.notices.sendToast('powercord-updater', {
          header: Messages.REPLUGGED_UPDATES_TOAST_FAILED,
          type: 'danger',
          buttons: [ {
            text: Messages.REPLUGGED_UPDATES_FORCE,
            color: 'red',
            look: 'outlined',
            onClick: () => this.askForce()
          }, {
            text: Messages.FRIEND_REQUEST_IGNORE,
            look: 'outlined',
            color: 'grey'
          }, {
            text: Messages.REPLUGGED_UPDATES_OPEN_UPDATER,
            color: 'blue',
            look: 'ghost',
            onClick: async () => {
              const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
              settingsModule.open('pc-updater');
            }
          } ]
        });
      }
    }
  }

  // MODALS
  askForce (callback) {
    openModal(() =>
      React.createElement(Confirm, {
        red: true,
        header: Messages.SUPPRESS_EMBED_TITLE,
        confirmText: Messages.REPLUGGED_UPDATES_FORCE,
        cancelText: Messages.CANCEL,
        onConfirm: () => {
          if (callback) {
            // eslint-disable-next-line callback-return
            callback();
          }
          this.doUpdate(true);
        },
        onCancel: closeModal
      }, React.createElement('div', { className: 'powercord-text' }, Messages.REPLUGGED_UPDATES_FORCE_MODAL))
    );
  }

  // UTILS
  skipUpdate (id, commit) {
    this.settings.set('entities_skipped', {
      ...this.settings.get('entities_skipped', {}),
      [id]: commit
    });
    this._removeUpdate(id);
  }

  disableUpdates (entity) {
    this.settings.set('entities_disabled', [
      ...this.settings.get('entities_disabled', []),
      {
        id: entity.id,
        name: entity.name,
        icon: entity.icon
      }
    ]);
    this._removeUpdate(entity.id);
  }

  enableUpdates (id) {
    this.settings.set('entities_disabled', this.settings.get('entities_disabled', []).filter(d => d.id !== id));
  }

  _removeUpdate (id) {
    this.settings.set('updates', this.settings.get('updates', []).filter(u => u.id !== id));
  }

  async getGitInfos () {
    const branch = await PowercordNative.exec('git branch', this.cwd)
      .then(({ stdout }) =>
        stdout
          .toString()
          .split('\n')
          .find(l => l.startsWith('*'))
          .slice(2)
          .trim()
      );

    const revision = await PowercordNative.exec(`git rev-parse ${branch}`, this.cwd)
      .then(r => r.stdout.toString().trim());

    const upstream = await PowercordNative.exec('git remote get-url origin', this.cwd)
      .then(r => r.stdout.toString().match(/github\.com[:/]([\w-_]+\/[\w-_]+)/)[1]);

    return {
      upstream,
      branch,
      revision
    };
  }

  async changeBranch (branch) {
    await PowercordNative.exec('git fetch origin +v2:v2', this.cwd);
    await PowercordNative.exec(`git checkout ${branch}`, this.cwd);
    // location.reload();
  }

  // Change Log
  async openChangeLogs () {
    const ChangeLog = await this._getChangeLogsComponent();
    openModal(() => React.createElement(ChangeLog, {
      changeLog: this.formatChangeLog(changelog)
    }));
  }

  async _getChangeLogsComponent () {
    if (!this._ChangeLog) {
      const _this = this;
      const { video } = await getModule([ 'video', 'added' ]);
      const DiscordChangeLog = await getModuleByDisplayName('ChangelogStandardTemplate');

      class ChangeLog extends DiscordChangeLog {
        constructor (props) {
          super(props);

          this.oldRenderHeader = this.renderHeader;
          this.renderHeader = this.renderNewHeader.bind(this);

          this.track = () => void 0;
          this.handleScroll = () => void 0;
        }

        renderNewHeader () {
          const header = this.oldRenderHeader();
          header.props.children[0].props.children = `Replugged - ${header.props.children[0].props.children}`;
          return header;
        }

        renderVideo () {
          if (!changelog.image) {
            return null;
          }

          return React.createElement('img', {
            src: changelog.image,
            className: video,
            alt: ''
          });
        }

        renderFooter () {
          const footer = super.renderFooter();
          footer.props.children = React.createElement('span', {
            style: { color: 'var(--text-normal)' },
            dangerouslySetInnerHTML: {
              __html: changelog.footer
            }
          });
          return footer;
        }

        close () {
          closeModal();
        }

        componentWillUnmount () {
          _this.settings.set('last_changelog', changelog.id);
        }
      }

      this._ChangeLog = ChangeLog;
    }
    return this._ChangeLog;
  }

  formatChangeLog (json) {
    let body = '';
    const colorToClass = {
      GREEN: 'added',
      ORANGE: 'progress',
      RED: 'fixed',
      BLURPLE: 'improved'
    };
    json.contents.forEach(item => {
      if (item.type === 'HEADER') {
        body += `${item.text.toUpperCase()} {${colorToClass[item.color]}${item.noMargin ? ' marginTop' : ''}}\n======================\n\n`;
      } else {
        if (item.text) {
          body += item.text;
          body += '\n\n';
        }
        if (item.list) {
          body += ` * ${item.list.join('\n\n * ')}`;
          body += '\n\n';
        }
      }
    });
    return {
      date: json.date,
      locale: 'en-us',
      revision: 1,
      body
    };
  }
};
