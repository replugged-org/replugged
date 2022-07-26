console.log(':/')

const { join } = require('path');

console.log('pre nekomata okayu')
const commands = require('../apis/commands')
console.log('nekomata okayu')
const connections = require('../apis/connections');
console.log('nekomata okayu #2')
const i18n2 = require('../apis/i18n');
console.log('nekomata okayu #3')
const keybinds = require('../apis/keybinds');
console.log('nekomata okayu #4')
const labs = require('../apis/labs');
console.log('nekomata okayu #5')
const notices = require('../apis/notices');
console.log('nekomata okayu #6')
const router = require('../apis/router');
console.log('nekomata okayu #7')
const rpc = require('../apis/rpc');
console.log('nekomata okayu #8')
const settings = require('../apis/settings');
console.log('nekomata okayu #9')

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
}

module.exports = class APIManager {
  constructor () {
    this.apis = [];
  }

  mount (api) {
    try {
      const APIClass = require(join(this.apiDir, api));
      api = api.replace(/\.js$/, '');
      powercord.api[api] = new APIClass();
      this.apis.push(api);
    } catch (e) {
      console.error('%c[Replugged:API]', 'color: #7289da', `An error occurred while initializing "${api}"!`, e);
    }
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
    this.apis = [];

    Object.values(apis).forEach(([name, APIClass]) => {
      try {
        powercord.api[name] = new APIClass();
        this.apis.push(name);
      } catch (e) {
        console.error('%c[Replugged:API]', 'color: #7289da', `An error occurred while initializing "${api}"!`, e);
      }  
    })

    await this.load();
  }
};
