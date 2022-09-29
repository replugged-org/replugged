import { dirname, join } from 'path';

import electron from 'electron';
import type { RepluggedWebContents } from '../types';

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main!.filename), '..', 'app.asar');
const discordPackage = require(join(discordPath, 'package.json'));
const discordMain = join(discordPath, discordPackage.main);
require.main!.filename = discordMain;

Object.defineProperty(global, 'appSettings', {
  set: (v /* : typeof global.appSettings*/) => {
    v.set(
      'DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING',
      true
    );
    // @ts-ignore
    delete global.appSettings;
    // @ts-ignore
    global.appSettings = v;
  },
  get: () => global.appSettings,
  configurable: true
});

// This class has to be named "BrowserWindow" exactly
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
// Thank you Ven for pointing this out!
class BrowserWindow extends electron.BrowserWindow {
  constructor (
    opts: electron.BrowserWindowConstructorOptions & {
      webContents: electron.WebContents;
      webPreferences: {
        nativeWindowOpen: boolean;
      };
    }
  ) {
    console.log(opts);
    const originalPreload = opts.webPreferences.preload!;

    if (opts.webContents) {
      // General purpose popouts used by Discord
    } else if (opts.webPreferences && opts.webPreferences.nodeIntegration) {
      // Splash Screen
      // opts.webPreferences.preload = join(__dirname, './preloadSplash.js');
    } else if (opts.webPreferences && opts.webPreferences.offscreen) {
      // Overlay
      //      originalPreload = opts.webPreferences.preload;
      // opts.webPreferences.preload = join(__dirname, './preload.js');
    } else if (opts.webPreferences && opts.webPreferences.preload) {
      // originalPreload = opts.webPreferences.preload;
      if (opts.webPreferences.nativeWindowOpen) {
        // Discord Client
        opts.webPreferences.preload = join(__dirname, './preload.js');
        // opts.webPreferences.contextIsolation = false; // shrug
      } else {
        // Splash Screen on macOS (Host 0.0.262+) & Windows (Host 0.0.293 / 1.0.17+)
        // opts.webPreferences.preload = join(__dirname, './preloadSplash.js');
      }
    }

    super(opts);
    (this.webContents as RepluggedWebContents).originalPreload =
      originalPreload;
  }
}

Object.defineProperty(BrowserWindow, 'name', { value: 'BrowserWindow',
  configurable: true });

const electronExports: typeof electron = new Proxy(electron, {
  get (target, prop) {
    switch (prop) {
      case 'BrowserWindow':
        return BrowserWindow;
      // Trick Babel's polyfill thing into not touching Electron's exported object with its logic
      case 'default':
        return electronExports;
      case '__esModule':
        return true;
      default:
        return target[prop as keyof typeof electron];
    }
  }
});

delete require.cache[electronPath]!.exports;
require.cache[electronPath]!.exports = electronExports;

// @ts-ignore
electron.app.setAppPath(discordPath);
electron.app.name = discordPackage.name;

// Copied from old codebase
electron.app.once('ready', () => {
  // @todo: Whitelist a few domains instead of removing CSP altogether; See #386
  electron.session.defaultSession.webRequest.onHeadersReceived(
    ({ responseHeaders }, done) => {
      if (!responseHeaders) {
        return done({});
      }

      Object.keys(responseHeaders)
        .filter((k) => (/^content-security-policy/i).test(k))
        .map((k) => delete responseHeaders[k]);

      done({ responseHeaders });
    }
  );
});

require('./ipc');

require('module')._load(discordMain);
