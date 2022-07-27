/* eslint-disable no-unused-vars */

const { ipcRenderer, webFrame } = require('electron');

if (!ipcRenderer) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

global.PowercordNative = {
  /**
   * Open DevTools for the current window
   * @param {object} opts Options to pass to Electron
   * @param {boolean} externalWindow Whether the DevTools should be opened in an external window or not.
   */
  openDevTools (opts, externalWindow) {
    return ipcRenderer.invoke('POWERCORD_OPEN_DEVTOOLS', opts, externalWindow);
  },

  /**
   * Closes DevTools for the current window
   */
  closeDevTools () {
    return ipcRenderer.invoke('POWERCORD_CLOSE_DEVTOOLS');
  },

  /**
   * Clears Chromium's cache
   * @returns {Promise<void>}
   */
  clearCache () {
    return ipcRenderer.invoke('POWERCORD_CACHE_CLEAR');
  },

  openBrowserWindow (opts) {
    throw new Error('Not implemented');
  },

  __compileSass (file) {
    return ipcRenderer.invoke('POWERCORD_COMPILE_MF_SASS', file);
  },

  exec (...args) {
    return ipcRenderer.invoke('POWERCORD_EXEC_COMMAND', ...args);
  }
};

if (!window.__SPLASH__) {
  const module = require('module');
  const originalRequire = module.prototype.require;
  module.prototype.require = function () {
    switch (arguments[0]) {
      case 'powercord/entities':
        return require('powercord/entities');
      case 'powercord/compilers':
        return require('powercord/compilers');
      case 'powercord/components':
        return require('powercord/components');
      case 'powercord/components/settings':
        return require('powercord/components/settings');
      case 'powercord/components/modal':
        return require('powercord/components/modal');
      case 'powercord/http':
        return require('powercord/http');
      case 'powercord/injector':
        return require('powercord/injector');
      case 'powercord/util':
        return require('powercord/util');
      case 'powercord/webpack':
        return require('powercord/webpack');
      case 'powercord/modal':
        return require('powercord/modal');
      case 'powercord/constants':
        return require('powercord/constants');
      case 'powercord':
        return require('../fake_node_modules/powercord');
    }

    return originalRequire.apply(this, arguments);
  };
}
