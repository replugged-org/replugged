import { join } from 'path';
import electron from 'electron';
const { shell: { openExternal } } = electron;
import { get } from 'powercord/http';
import { sleep } from 'powercord/util';
import { init as _init } from 'powercord/webpack';
import { WEBSITE } from 'powercord/constants';
import { Updatable } from 'powercord/entities';

import PluginManager from './managers/plugins';
import StyleManager from './managers/styles';
import APIManager from './managers/apis';
import modules from './modules';
import type CommandsAPI from './apis/commands';
import type ConnectionsAPI from './apis/connections';
import type I18nAPI from './apis/i18n';
import type KeybindsAPI from './apis/keybinds';
import type LabsAPI from './apis/labs';
import type NoticesAPI from './apis/notices';
import type RouterAPI from './apis/router';
import type SettingsAPI from './apis/settings';
import type RpcAPI from './apis/rpc';
let coremods;

/**
 * @typedef PowercordAPI
 * @property {CommandsAPI} commands
 * @property {SettingsAPI} settings
 * @property {NoticesAPI} notices
 * @property {KeybindsAPI} keybinds
 * @property {RouterAPI} router
 * @property {ConnectionsAPI} connections
 * @property {I18nAPI} i18n
 * @property {RPCAPI} rpc
 * @property {LabsAPI} labs
 */

type PowercordAPI = {
  commands: CommandsAPI,
  settings: SettingsAPI,
  notices: NoticesAPI,
  keybinds: KeybindsAPI,
  router: RouterAPI,
  connections: ConnectionsAPI,
  i18n: I18nAPI,
  rpc: RpcAPI,
  labs: LabsAPI
}

/**
 * @typedef GitInfos
 * @property {String} upstream
 * @property {String} branch
 * @property {String} revision
 */

type GitInfos = {
  upstream: string,
  branch: string,
  revision: string
};

/**
 * Main Replugged class
 * @type {Powercord}
 * @property {PowercordAPI} api
 * @property {StyleManager} styleManager
 * @property {PluginManager} pluginManager
 * @property {APIManager} apiManager
 * @property {GitInfos} gitInfos
 * @property {Object|null} account
 * @property {Boolean} initialized
 */
class Powercord extends Updatable {
  api: PowercordAPI;
  styleManager: StyleManager;
  pluginManager: PluginManager;
  apiManager: APIManager;
  gitInfos: GitInfos;
  initialized: boolean;
  account: object | null;
  isLinking: boolean;
  settings: SettingsAPI.SettingsCategory;

  constructor () {
    super(join(__dirname, '..', '..'), '', 'powercord');

    this.api = {};
    this.gitInfos = {
      upstream: '???',
      branch: '???',
      revision: '???'
    };
    this.initialized = false;
    this.styleManager = new StyleManager();
    this.pluginManager = new PluginManager();
    this.apiManager = new APIManager();
    this.account = null;
    this.isLinking = false;
    // this.hookRPCServer();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  // Replugged initialization
  async init () {
    const isOverlay = (/overlay/).test(location.pathname);
    if (isOverlay) { // eh
      // await sleep(250);
    }

    // Webpack & Modules
    await _init();
    await Promise.all(modules.map(mdl => mdl()));
    this.emit('initializing');

    // Start
    await this.startup();
    this.fetchAccount();
    this.gitInfos = await this.pluginManager.get('pc-updater').getGitInfos();

    // Token manipulation stuff
    if (this.settings.get('hideToken', true)) {
      const tokenModule = await require('powercord/webpack').getModule([ 'hideToken' ]);
      tokenModule.hideToken = () => void 0;
      setImmediate(() => tokenModule.showToken()); // just to be sure
    }


    window.addEventListener('beforeunload', () => {
      if (this.account && this.settings.get('settingsSync', false)) {
        powercord.api.settings.upload();
      }
    });

    // Patch bootstrap logic
    if (process.platform === 'win32' && DiscordNative.nativeModules.canBootstrapNewUpdater) {
      this.patchBootstrapUpdater();
    }

    this.emit('loaded');
  }

  // Replugged startup
  async startup () {
    // APIs
    await this.apiManager.startAPIs();
    this.settings = powercord.api.settings.buildCategoryObject('pc-general');
    this.emit('settingsReady');

    // Style Manager
    this.styleManager.loadThemes();

    // Plugins
    coremods = require('./coremods');
    await coremods.load();
    await this.pluginManager.startPlugins();

    this.initialized = true;
  }

  // Replugged shutdown
  async shutdown () {
    this.initialized = false;
    // Plugins
    await this.pluginManager.shutdownPlugins();
    await coremods.unload();

    // Style Manager
    this.styleManager.unloadThemes();

    // APIs
    await this.apiManager.unload();
  }

  // Bad code
  async hookRPCServer () {
    const _this = this;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (!global.DiscordNative) {
      await sleep(1);
    }

    await DiscordNative.nativeModules.ensureModule('discord_rpc');
    const discordRpc = DiscordNative.nativeModules.requireModule('discord_rpc');
    const { createServer } = discordRpc.RPCWebSocket.http;
    discordRpc.RPCWebSocket.http.createServer = function () {
      _this.rpcServer = createServer();
      return _this.rpcServer;
    };
  }

  async patchBootstrapUpdater () {
    const { inject } = require('../../injectors/main');
    const injector = require(`../../injectors/${process.platform}`);

    await DiscordNative.nativeModules.ensureModule('discord_updater_bootstrap');

    const BootstrapUpdater = DiscordNative.nativeModules.requireModule('discord_updater_bootstrap');
    BootstrapUpdater.finishBootstrap = (({ finishBootstrap }) => () => {
      inject(injector).then(() => finishBootstrap());
    })(BootstrapUpdater);
  }

  async fetchAccount () {
    if (this.isLinking) {
      while (this.isLinking) {
        await sleep(1);
      }
      return;
    }

    this.isLinking = true;
    const token = this.settings.get('powercordToken', null);
    if (token) {
      const baseUrl = this.settings.get('backendURL', WEBSITE);
      console.debug('%c[Replugged]', 'color: #7289da', 'Logging in to your account...');

      const resp = await get(`${baseUrl}/api/v1/users/@me`)
        .set('Authorization', token)
        .catch(e => e);

      if (resp.statusCode === 401) {
        if (!resp.body.error && resp.body.error !== 'DISCORD_REVOKED') {
          powercord.api.notices.sendAnnouncement('pc-account-discord-unlinked', {
            color: 'red',
            message: 'Your Replugged account is no longer linked to your Discord account! Some integrations will be disabled.',
            button: {
              text: 'Link it back',
              onClick: () => openExternal(`${WEBSITE}/api/v1/oauth/discord`)
            }
          });

          this.isLinking = false;
          return; // keep token stored
        }
        this.settings.set('powercordToken', null);
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Replugged]', 'color: #7289da', 'Unable to fetch your account (Invalid token). Removed token from config');
      } else if (resp.statusCode !== 200) {
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Replugged]', 'color: #7289da', `An error occurred while fetching your account: ${resp.statusCode} - ${resp.statusText}`, resp.body);
      }

      this.account = resp.body;
      this.account.token = token;
    } else {
      this.account = null;
    }
    console.debug('%c[Replugged]', 'color: #7289da', 'Logged in!');
    this.isLinking = false;
  }

  async _update (force = false) {
    const success = await super._update(force);
    if (success) {
      await PowercordNative.exec('npm install --only=prod', { cwd: this.entityPath });
      const updater = this.pluginManager.get('pc-updater');
      if (!document.querySelector('#powercord-updater, .powercord-updater')) {
        powercord.api.notices.sendToast('powercord-updater', {
          header: 'Update complete!',
          content: 'Please click "Reload" to complete the final stages of this Replugged update.',
          type: 'success',
          buttons: [ {
            text: 'Reload',
            color: 'green',
            look: 'ghost',
            onClick: () => location.reload()
          }, {
            text: 'Postpone',
            color: 'grey',
            look: 'outlined'
          } ]
        });
      }
      updater.settings.set('awaiting_reload', true);
    }
    return success;
  }
}

export default Powercord;
