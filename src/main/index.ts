import { dirname, join } from "path";
import electron from "electron";
import { CONFIG_PATHS, readSettingsSync } from "src/util.mjs";
import type { RepluggedWebContents } from "../types";
import { getSetting } from "./ipc/settings";

const settings = readSettingsSync("dev.replugged.Settings");
const electronPath = require.resolve("electron");
const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
// require.main!.filename = discordMain;

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
  POP_OUT,
  SPLASH_SCREEN,
  OVERLAY,
  DISCORD_CLIENT,
}

function windowTypeFromOpts(
  opts: electron.BrowserWindowConstructorOptions & {
    webContents: electron.WebContents;
    webPreferences: {
      nativeWindowOpen: boolean;
    };
  },
): DiscordWindowType {
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
  return opts.webContents;
}

// This class has to be named "BrowserWindow" exactly
// https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
// Thank you, Ven, for pointing this out!
class BrowserWindow extends electron.BrowserWindow {
  public constructor(
    opts: electron.BrowserWindowConstructorOptions & {
      webContents: electron.WebContents;
      webPreferences: {
        nativeWindowOpen: boolean;
      };
    },
  ) {
    const originalPreload = opts.webPreferences.preload;

    const currentWindow = windowTypeFromOpts(opts);

    switch (currentWindow) {
      case DiscordWindowType.DISCORD_CLIENT: {
        opts.webPreferences.preload = join(__dirname, "./preload.js");

        if (settings.get("transparentWindow")) {
          opts.transparent = true;
          opts.frame = process.platform === "win32" ? false : opts.frame;
          // TODO: Figure out what background color each OS needs.
          opts.backgroundColor = "#00000000";
        }
        break;
      }
      case DiscordWindowType.SPLASH_SCREEN: {
        // opts.webPreferences.preload = join(__dirname, './preloadSplash.js');
        break;
      }
      case DiscordWindowType.OVERLAY: {
        // opts.webPreferences.preload = join(__dirname, './preload.js');
        break;
      }
    }

    super(opts);

    if (
      currentWindow === DiscordWindowType.DISCORD_CLIENT &&
      settings.get("transparentWindow") &&
      process.platform === "darwin"
    ) {
      this.on("ready-to-show", () => {
        // TODO: As far as I know, this is only needed on some macOS versions.
        // This automatically maximizes the window on all displays the window is dragged to
        this.maximize();
        this.setResizable(false);
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
      return done({});
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

require("module")._load(discordPath);
