import { join } from 'path';

export default class APIManager {
  constructor () {
    this.apis = [];
  }

  async load () {
    for (const api of this.apis) {
      await powercord.api[api]._load();
    }
  }

  async unload () {
    for (const api of this.apis) {
      await powercord.api[api]._unload();
    }
  }

  // Start
  async startAPIs () {
    const commands = require('../apis/commands');
    const connections = require('../apis/connections');
    const i18n = require('../apis/i18n');
    const keybinds = require('../apis/keybinds');
    const labs = require('../apis/labs').default;
    const notices = require('../apis/notices');
    const router = require('../apis/router').default;
    const rpc = require('../apis/rpc').default;
    const settings = require('../apis/settings');

    const apis = {
      commands,
      connections,
      i18n,
      keybinds,
      labs,
      notices,
      router,
      rpc,
      settings
    };

    this.apis = [];

    Object.entries(apis).forEach(([ name, APIClass ]) => {
      console.log(name, APIClass);
      try {
        powercord.api[name] = new APIClass();
        this.apis.push(name);
      } catch (e) {
        console.error('%c[Replugged:API]', 'color: #7289da', `An error occurred while initializing "${api}"!`, e);
      }
    });

    await this.load();
  }
}
