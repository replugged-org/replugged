import electron, { type BrowserWindowConstructorOptions } from "electron";
import { join } from "path";
import { getAllSettings } from "../ipc/settings";
import type { BackgroundMaterialType, RepluggedWebContents, VibrancyType } from "src/types";

const electronPath = require.resolve("electron");

// This class has to be named "BrowserWindow" exactly
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
// Thank you, Ven, for pointing this out!
class BrowserWindow extends electron.BrowserWindow {
  public constructor(opts: BrowserWindowConstructorOptions) {
    const generalSettings = getAllSettings("dev.replugged.Settings");
    const originalPreload = opts.webPreferences?.preload;

    if (opts.frame && process.platform === "linux" && generalSettings.titleBar) opts.frame = void 0;

    // Load our preload script if it's the main window or the splash screen
    if (
      opts.webPreferences?.preload &&
      (opts.title || opts.webPreferences.preload.includes("splash"))
    ) {
      opts.webPreferences.preload = join(__dirname, "./preload.js");

      if (generalSettings.transparency) {
        opts.transparent = true;
        opts.backgroundColor = "#00000000";
        if (process.platform === "win32" && generalSettings.backgroundMaterial) {
          opts.backgroundMaterial = generalSettings.backgroundMaterial as BackgroundMaterialType;
        }
        if (process.platform === "darwin" && generalSettings.vibrancy) {
          opts.vibrancy = generalSettings.vibrancy as VibrancyType;
        }
      }

      if (generalSettings.disableMinimumSize) {
        opts.minWidth = 0;
        opts.minHeight = 0;
      }

      super(opts);

      if (generalSettings.disableMinimumSize) this.setMinimumSize = () => undefined;
      (this.webContents as RepluggedWebContents).originalPreload = originalPreload;
    }
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
