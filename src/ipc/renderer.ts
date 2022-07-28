/* eslint-disable no-unused-vars */

import type { exec } from 'child_process';
import module from 'module';
import { ipcRenderer } from 'electron';

if (!ipcRenderer) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

const powercordNative = {
  /**
   * Open DevTools for the current window
   * @param {object} opts Options to pass to Electron
   * @param {boolean} externalWindow Whether the DevTools should be opened in an external window or not.
   */
  openDevTools (opts: object, externalWindow: boolean) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openBrowserWindow (_opts: unknown) {
    throw new Error('Not implemented');
  },

  __compileSass (file: string) {
    return ipcRenderer.invoke('POWERCORD_COMPILE_MF_SASS', file);
  },

  exec (...args: Parameters<typeof exec>) {
    return ipcRenderer.invoke('POWERCORD_EXEC_COMMAND', ...args);
  }
};

declare global {
  // eslint-disable-next-line no-var
  var PowercordNative: typeof powercordNative;
}


global.PowercordNative = powercordNative;

if (!window.__SPLASH__) {
  const originalRequire = module.prototype.require;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  module.prototype.require = function (id: string) {
    switch (id) {
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

    return originalRequire.apply(this, [ id ]);
  };
}
