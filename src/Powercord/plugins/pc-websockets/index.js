const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = class WSLinks extends Plugin {
  async startPlugin () {
    await this._patchWebSocketServer();
  }

  pluginWillUnload () {
    uninject('pc-ws-onConnect');
  }

  async _patchWebSocketServer () {
    const SocketsHandler = await getModule(m => m.Z?.__proto__?.handleConnection, false).Z;
    console.log(SocketsHandler);

    inject('pc-ws-onConnect', SocketsHandler, 'handleConnection', (args) => {
      console.log('[WSLinks] validateSocketClient');
      const socket = args[0];
      console.log(socket);
      if (socket.upgradeReq().url !== '/replugged') {
        return args;
      }
      socket.close();
      console.log(args);
      return args;
    }, true);
  }
};
