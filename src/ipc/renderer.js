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
  require.cache['powercord/compilers'] = { exports: require('powercord/compilers') }
  require.cache['powercord/components'] = { exports: require('powercord/components') }
  require.cache['powercord/components/settings'] = { exports: require('powercord/components/settings') }
  require.cache['powercord/http'] = { exports: require('powercord/http') }
  require.cache['powercord/injector'] = { exports: require('powercord/injector') }
  require.cache['powercord/util'] = { exports: require('powercord/util') }
  require.cache['powercord/webpack'] = { exports: require('powercord/webpack') }
  require.cache['powercord/constants'] = { exports: require('powercord/constants') }
  require.cache['powercord/modal'] = { exports: require('powercord/modal') }
  require.cache['powercord'] = { exports: require('../fake_node_modules/powercord') }
}