import { dirname, join } from "path";
import electron from "electron";
import { CONFIG_PATHS, readSettingsSync } from "src/util.mjs";
import type { RepluggedWebContents } from "../types";
import { getSetting } from "./ipc/settings";
// @ts-expect-error Type defs are obtained through @pyke/vibe
import vibePath from "../vibe.node";

let vibe: typeof import("@pyke/vibe");
if (process.platform === "win32") {
  vibe = require(vibePath) as unknown as typeof import("@pyke/vibe");
  vibe.setup(electron.app);
}

const settings = readSettingsSync("dev.replugged.Settings");
const electronPath = require.resolve("electron");
const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
const discordPackage = require(join(discordPath, "package.json"));
require.main!.filename = join(discordPath, discordPackage.main);

Object.defineProperty(global, "appSettings", {
  set: (v /* : typeof global.appSettings*/) => {
    // cspell:ignore youre
    v.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete global.appSettings;
    global.appSettings = v;
  },
  get: () => global.appSettings,
  configurable: true,
});

enum DiscordWindowType {
  UNKNOWN,
  POP_OUT,
  SPLASH_SCREEN,
  OVERLAY,
  DISCORD_CLIENT,
}

type InternalBrowserWindowConstructorOptions = electron.BrowserWindowConstructorOptions & {
  webContents?: electron.WebContents;
  webPreferences?: {
    nativeWindowOpen: boolean;
  };
};

function windowTypeFromOpts(opts: InternalBrowserWindowConstructorOptions): DiscordWindowType {
  if (opts.webContents) {
    return DiscordWindowType.POP_OUT;
  } else if (opts.webPreferences?.nodeIntegration) {
    return DiscordWindowType.SPLASH_SCREEN;
  } else if (opts.webPreferences?.offscreen) {
    return DiscordWindowType.OVERLAY;
  } else if (opts.webPreferences?.preload) {
    if (opts.webPreferences.nativeWindowOpen) {
      return DiscordWindowType.DISCORD_CLIENT;
    } else {
      return DiscordWindowType.SPLASH_SCREEN;
    }
  }

  return DiscordWindowType.UNKNOWN;
}

// This class has to be named "BrowserWindow" exactly
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
// Thank you, Ven, for pointing this out!
class BrowserWindow extends electron.BrowserWindow {
  public constructor(opts: InternalBrowserWindowConstructorOptions) {
    const originalPreload = opts.webPreferences?.preload;

    const currentWindow = windowTypeFromOpts(opts);

    switch (currentWindow) {
      case DiscordWindowType.DISCORD_CLIENT: {
        opts.webPreferences!.preload = join(__dirname, "./preload.js");

        if (settings.get("transparentWindow")) {
          switch (process.platform) {
            case "win32":
              // @todo: Menu bar will need to be remade
              opts.autoHideMenuBar = true;
              opts.show = false; // @todo: Unsure if this is needed everywhere
              break;
            case "linux":
              opts.transparent = true;
              break;
          }
          // @todo: Determine what `frame` value is needed on each platform
          // @todo: Determine what `backgroundColor` is needed on each platform
        }
        break;
      }
      case DiscordWindowType.SPLASH_SCREEN: {
        // opts.webPreferences.preload = join(__dirname, "./preloadSplash.js");
        break;
      }
      case DiscordWindowType.OVERLAY: {
        // opts.webPreferences.preload = join(__dirname, "./preload.js");
        break;
      }
    }

    super(opts);

    if (currentWindow === DiscordWindowType.DISCORD_CLIENT && settings.get("transparentWindow")) {
      this.on("ready-to-show", () => {
        // if (process.platform === "win32") {
        //   vibe.applyEffect(this, "unified-acrylic");
        //   vibe.forceTheme(this, "dark");
        // }
        // @todo: unsure if this is needed
        this.setBackgroundColor("#00000000");
      });
    }

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

(
  electron.app as typeof electron.app & {
    setAppPath: (path: string) => void;
  }
).setAppPath(discordPath);
// electron.app.name = discordPackage.name;

electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: "replugged",
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
    },
  },
]);

async function loadReactDevTools(): Promise<void> {
  const rdtSetting = await getSetting("dev.replugged.Settings", "reactDevTools", false);

  if (rdtSetting) {
    void electron.session.defaultSession.loadExtension(CONFIG_PATHS["react-devtools"]);
  }
}

// Copied from old codebase
electron.app.once("ready", () => {
  electron.session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: ["https://*/api/v*/science", "https://*/api/v*/metrics", "https://sentry.io/*"],
    },
    function (_details, callback) {
      callback({ cancel: true });
    },
  );
  // @todo: Whitelist a few domains instead of removing CSP altogether; See #386
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    if (!responseHeaders) {
      done({});
      return;
    }

    const hasFrameOptions = Object.keys(responseHeaders).find((e) => /x-frame-options/i.test(e));
    const hasAllowCredentials = Object.keys(responseHeaders).find((e) =>
      /access-control-allow-credentials/i.test(e),
    );

    const headersWithoutCSP = Object.fromEntries(
      Object.entries(responseHeaders).filter(
        ([k]) =>
          !/^x-frame-options/i.test(k) &&
          !/^content-security-policy/i.test(k) &&
          !(/^access-control-allow-origin$/i.test(k) && !hasAllowCredentials),
      ),
    );

    if (!hasAllowCredentials) {
      headersWithoutCSP["Access-Control-Allow-Origin"] = ["*"];
    }

    if (hasFrameOptions) {
      headersWithoutCSP["Content-Security-Policy"] = [
        "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com;",
      ];
    }

    done({ responseHeaders: headersWithoutCSP });
  });

  electron.protocol.registerFileProtocol("replugged", (request, cb) => {
    let filePath = "";
    const reqUrl = new URL(request.url);
    switch (reqUrl.hostname) {
      case "renderer":
        filePath = join(__dirname, "./renderer.js");
        break;
      case "renderer.css":
        filePath = join(__dirname, "./renderer.css");
        break;
      case "quickcss":
        filePath = join(CONFIG_PATHS.quickcss, reqUrl.pathname);
        break;
      case "theme":
        filePath = join(CONFIG_PATHS.themes, reqUrl.pathname);
        break;
      case "plugin":
        filePath = join(CONFIG_PATHS.plugins, reqUrl.pathname);
        break;
    }
    cb({ path: filePath });
  });

  void loadReactDevTools();
});

// This module is required this way at runtime.
require("./ipc");

require(discordPath);
