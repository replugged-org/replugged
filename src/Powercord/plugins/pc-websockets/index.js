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
    const SocketsHandler = await getModule([ 'validateSocketClient' ]);
    console.log(SocketsHandler);

    inject('pc-ws-onConnect', SocketsHandler, 'validateSocketClient', (args) => {
      console.log('[WSLinks] validateSocketClient');
      const socket = args[0]._socket;
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
