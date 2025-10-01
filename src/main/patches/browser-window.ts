import electron, { type BrowserWindowConstructorOptions } from "electron";
import { join } from "path";
import { getSetting } from "../ipc/settings";
import type { RepluggedWebContents } from "src/types";

const electronPath = require.resolve("electron");

// This class has to be named "BrowserWindow" exactly
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
// Thank you, Ven, for pointing this out!
class BrowserWindow extends electron.BrowserWindow {
  public constructor(opts: BrowserWindowConstructorOptions) {
    const titleBarSetting = getSetting<boolean>("dev.replugged.Settings", "titleBar", false);
    if (opts.frame && process.platform === "linux" && titleBarSetting) opts.frame = void 0;

    const originalPreload = opts.webPreferences?.preload;

    // Load our preload script if it's the main window or the splash screen
    if (
      opts.webPreferences?.preload &&
      (opts.title || opts.webPreferences.preload.includes("splash"))
    ) {
      opts.webPreferences.preload = join(__dirname, "./preload.js");
    }

    super(opts);
    (this.webContents as RepluggedWebContents).originalPreload = originalPreload;
  }
}

Object.defineProperty(BrowserWindow, "name", {
  value: "BrowserWindow",
  configurable: true,
});

const electronExports: typeof electron = new Proxy(electron, {
  get(target, prop) {
    switch (prop) {
      case "BrowserWindow":
        return BrowserWindow;
      // Trick Babel's polyfill thing into not touching Electron's exported object with its logic
      case "default":
        return electronExports;
      case "__esModule":
        return true;
      default:
        return target[prop as keyof typeof electron];
    }
  },
});

delete require.cache[electronPath]!.exports;
require.cache[electronPath]!.exports = electronExports;
