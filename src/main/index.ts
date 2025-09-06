import electron, {
  type BrowserWindowConstructorOptions,
  Menu,
  type MenuItemConstructorOptions,
  app,
  dialog,
  net,
  protocol,
  session,
  shell,
} from "electron";
import { dirname, join } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import type { PackageJson } from "type-fest";
import { pathToFileURL } from "url";
import type { RepluggedWebContents } from "../types";
import { getSetting } from "./ipc/settings";
import { getRepluggedVersion, store as getStoreAddon, installAddon } from "./ipc/installer";

const electronPath = require.resolve("electron");
const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
const discordPackage: PackageJson = require(join(discordPath, "package.json"));
require.main!.filename = join(discordPath, discordPackage.main!);

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

(
  app as typeof app & {
    setAppPath: (path: string) => void;
  }
).setAppPath(discordPath);
// app.name = discordPackage.name;

const repluggedProtocol = {
  scheme: "replugged",
  privileges: {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    stream: true,
    supportFetchAPI: true,
  },
};

// Monkey patch to ensure our protocol is always included, even if Discord tries to override it with their own schemes.
const originalRegisterSchemesAsPrivileged = protocol.registerSchemesAsPrivileged.bind(protocol);
originalRegisterSchemesAsPrivileged([repluggedProtocol]);
protocol.registerSchemesAsPrivileged = (customSchemes: Electron.CustomScheme[]) => {
  const combinedSchemes = [repluggedProtocol, ...customSchemes];
  originalRegisterSchemesAsPrivileged(combinedSchemes);
};

// Monkey patch to add our menu items into the tray context menu.
const defaultBuildFromTemplate = Menu.buildFromTemplate.bind(Menu);
const currentVersion = getRepluggedVersion();

Menu.buildFromTemplate = (items: MenuItemConstructorOptions[]) => {
  // Make sure first item is Discord and so that its not in popout or any other menu
  if (items[0]?.label !== "Discord") return defaultBuildFromTemplate(items);
  if (!items.find((e) => e.label === "Replugged"))
    items.splice(
      // Quit + separator
      -2,
      0,
      { type: "separator" },
      {
        label: "Replugged",
        submenu: [
          {
            label: "Toggle DevTools",
            role: "toggleDevTools",
            accelerator: "F12",
          },
          {
            // Should we just do enabled: currentVersion !== "dev" instead of dialog??
            label: "Update Replugged",
            click: async (_) => {
              if (currentVersion === "dev") {
                void dialog.showMessageBox({
                  type: "info",
                  title: "Developer Mode",
                  message:
                    "You are currently running Replugged in developer mode and Replugged will not be able to update itself.",
                  buttons: ["Ok"],
                });
                return;
              }
              const repluggedInfo = await getStoreAddon("dev.replugged.Replugged");

              if (!repluggedInfo.success) {
                void dialog.showMessageBox({
                  type: "error",
                  title: "Failed Check",
                  message: "Failed while checking for updates. Check logs for more info!",
                  buttons: ["Close"],
                });
                console.error(repluggedInfo.error);
                return;
              }
              const newVersion = repluggedInfo.manifest.version;
              if (currentVersion === newVersion) {
                void dialog.showMessageBox({
                  type: "info",
                  title: "Up to date",
                  message: "Replugged is already up to date.",
                  buttons: ["Ok"],
                });
                return;
              }
              const installed = await installAddon(
                "replugged",
                "replugged.asar",
                repluggedInfo.url,
                true,
                newVersion,
              );
              if (!installed.success) {
                void dialog.showMessageBox({
                  type: "error",
                  title: "Failed Install",
                  message: "Failed while installing updates. Check logs for more info!",
                  buttons: ["Close"],
                });
                console.error(installed.error);
                return;
              }

              await dialog.showMessageBox({
                type: "info",
                title: "Successfully Updated",
                message:
                  process.platform === "linux"
                    ? "Replugged updated but we can't relaunch automatically due to an bug on electron linux, discord will close now!"
                    : "Replugged update and will relaunch discord now to take effects!",
                buttons: ["Ok"],
              });
              app.relaunch();
              app.quit();
            },
          },
          {
            label: "Contributors",
            click: () => shell.openExternal("https://replugged.dev/contributors"),
          },
          {
            enabled: false,
            label: `Version: ${currentVersion === "dev" ? "" : "v"}${currentVersion}`,
          },
        ],
      },
    );

  return defaultBuildFromTemplate(items);
};

// Copied from old codebase
app.once("ready", () => {
  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: [
        "https://*/api/v*/science",
        "https://*/api/v*/metrics",
        "https://*/api/v*/metrics/*",
        "https://sentry.io/*",
        "https://discord.com/assets/sentry.*.js",
        "https://*.discord.com/assets/sentry.*.js",
      ],
    },
    function (_details, callback) {
      callback({ cancel: true });
    },
  );
  // @todo: Whitelist a few domains instead of removing CSP altogether; See #386
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
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

  // TODO: Eventually in the future, this should be migrated to IPC for better performance
  protocol.handle("replugged", (request) => {
    let filePath = "";
    const reqUrl = new URL(request.url);
    switch (reqUrl.hostname) {
      case "renderer.css":
        filePath = join(__dirname, "./renderer.css");
        break;
      case "assets":
        filePath = join(__dirname, reqUrl.hostname, reqUrl.pathname);
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
    return net.fetch(pathToFileURL(filePath).toString());
  });

  const defaultPermissionRequestHandler = session.defaultSession.setPermissionRequestHandler.bind(
    session.defaultSession,
  );
  session.defaultSession.setPermissionRequestHandler = (cb) => {
    defaultPermissionRequestHandler((webContents, permission, callback, details) => {
      if (permission === "media") {
        callback(true);
        return;
      }
      cb?.(webContents, permission, callback, details);
    });
  };

  const rdtSetting = getSetting<boolean>("dev.replugged.Settings", "reactDevTools", false);
  if (rdtSetting) {
    void session.defaultSession.loadExtension(CONFIG_PATHS["react-devtools"]);
  }
});

// This module is required this way at runtime.
require("./ipc");

require(discordPath);
