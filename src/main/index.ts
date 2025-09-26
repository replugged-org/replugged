import electron, { Menu, app, dialog, net, protocol, session } from "electron";
import { dirname, join } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import type { PackageJson } from "type-fest";
import { pathToFileURL } from "url";
import type { RepluggedWebContents } from "../types";
import { getAddonInfo, getRepluggedVersion, installAddon } from "./ipc/installer";
import { getSetting } from "./ipc/settings";

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
  public constructor(opts: Electron.BrowserWindowConstructorOptions) {
    const titleBarSetting = getSetting<boolean>("dev.replugged.Settings", "titleBar", false);
    const transparentWindowSetting = getSetting<boolean>(
      "dev.replugged.Settings",
      "transparentWindow",
      false,
    );

    if (opts.frame && process.platform === "linux" && titleBarSetting) opts.frame = void 0;

    const originalPreload = opts.webPreferences?.preload;

    // Load our preload script if it's the main window or the splash screen
    if (
      opts.webPreferences?.preload &&
      (opts.title || opts.webPreferences.preload.includes("splash"))
    ) {
      opts.webPreferences.preload = join(__dirname, "./preload.js");

      if (transparentWindowSetting) {
        if (process.platform === "win32" || process.platform === "linux") {
          opts.transparent = true;
        }
      }
    }

    super(opts);

    // Center the unmaximized location
    if (transparentWindowSetting) {
      let lastBounds = this.getBounds();
      // Default to the center of the screen at 1440x810 scale for a 1080p monitor (75%)
      const primaryDisplaySize = electron.screen.getPrimaryDisplay().workAreaSize;
      let lastLastBounds = {
        width: primaryDisplaySize.width * 0.75,
        height: primaryDisplaySize.height * 0.75,
        x: primaryDisplaySize.width / 2 - (primaryDisplaySize.width * 0.75) / 2,
        y: primaryDisplaySize.height / 2 - (primaryDisplaySize.height * 0.75) / 2,
      };
      let lastResize = Date.now();
      this.on("resize", () => {
        const bounds = this.getBounds();
        lastLastBounds = lastBounds;
        lastBounds = bounds;
        lastResize = Date.now();
      });

      this.on("maximize", () => {
        // Get the display at the center of the window
        const screenBounds = this.getBounds();
        const windowDisplay = electron.screen.getDisplayNearestPoint({
          x: screenBounds.x + screenBounds.width / 2,
          y: screenBounds.y + screenBounds.height / 2,
        });
        const workAreaSize = windowDisplay.workArea;

        const isSizeMaximized =
          lastBounds.width === workAreaSize.width && lastBounds.height === workAreaSize.height;
        const isPositionMaximized =
          lastBounds.x === workAreaSize.x + 1 && lastBounds.y === workAreaSize.y + 1;

        // if we haven't resized in the last few ms, we probably didn't actually maximize and should instead unmaximize
        if (lastResize < Date.now() - 10 || (isSizeMaximized && isPositionMaximized)) {
          // Calculate new x, y to be in the center of the monitor
          this.setBounds({
            x: workAreaSize.width / 2 - lastLastBounds.width / 2 + workAreaSize.x,
            y: workAreaSize.height / 2 - lastLastBounds.height / 2 + workAreaSize.y,
            width: lastLastBounds.width,
            height: lastLastBounds.height,
          });

          lastResize = Date.now();
          return;
        }

        // Move the window to 1,1 to mitigate the window going grey when maximized
        // Note that the window doesn't seem to visually be at 1,1, but that's enough to prevent the greying
        this.setBounds({
          x: workAreaSize.x + 1,
          y: workAreaSize.y + 1,
          width: screenBounds.width,
          height: screenBounds.height,
        });
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

// Monkey patch to ensure our protocol is always included, even if Discord tries to override it with their own schemes
const originalRegisterSchemesAsPrivileged = protocol.registerSchemesAsPrivileged.bind(protocol);
originalRegisterSchemesAsPrivileged([repluggedProtocol]);
protocol.registerSchemesAsPrivileged = (customSchemes: Electron.CustomScheme[]) => {
  const combinedSchemes = [repluggedProtocol, ...customSchemes];
  originalRegisterSchemesAsPrivileged(combinedSchemes);
};

// Monkey patch to add our menu items into the tray context menu
const originalBuildFromTemplate = Menu.buildFromTemplate.bind(Menu);

async function showInfo(title: string, message: string): Promise<Electron.MessageBoxReturnValue> {
  return dialog.showMessageBox({ type: "info", title, message, buttons: ["Ok"] });
}
async function showError(title: string, message: string): Promise<Electron.MessageBoxReturnValue> {
  return dialog.showMessageBox({ type: "error", title, message, buttons: ["Close"] });
}

Menu.buildFromTemplate = (items: Electron.MenuItemConstructorOptions[]) => {
  if (items[0]?.label !== "Discord" || items.some((e) => e.label === "Replugged"))
    return originalBuildFromTemplate(items);

  const currentVersion = getRepluggedVersion();

  const repluggedMenuItems: Electron.MenuItemConstructorOptions = {
    label: "Replugged",
    submenu: [
      {
        label: "Toggle Developer Tools",
        click: () => {
          const win =
            BrowserWindow.getFocusedWindow() ||
            BrowserWindow.getAllWindows().find((w) => !w.isDestroyed() && !w.getParentWindow());
          if (win) win.webContents.toggleDevTools();
        },
        accelerator: process.platform === "darwin" ? "Option+Cmd+I" : "Ctrl+Shift+I",
      },
      {
        label: "Update Replugged",
        click: async () => {
          try {
            if (currentVersion === "dev") {
              await showInfo(
                "Developer Mode",
                "You are currently running Replugged in developer mode and Replugged will not be able to update itself.",
              );
              return;
            }

            const repluggedInfo = await getAddonInfo("store", "dev.replugged.Replugged");
            if (!repluggedInfo.success) {
              console.error(repluggedInfo.error);
              await showError(
                "Update Check Failed",
                "Unable to check for Replugged updates. Check logs for details.",
              );
              return;
            }

            const newVersion = repluggedInfo.manifest.version;
            if (currentVersion === newVersion) {
              await showInfo(
                "Up to Date",
                `You're running the latest version of Replugged (v${currentVersion}).`,
              );
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
              console.error(installed.error);
              await showError(
                "Install Update Failed",
                "An error occurred while installing the Replugged update. Check logs for details.",
              );
              return;
            }

            await showInfo(
              "Successfully Updated",
              process.platform === "linux"
                ? "Replugged updated but we can't relaunch automatically on Linux. Discord will close now."
                : "Replugged updated and will relaunch Discord now to take effect!",
            );

            app.relaunch();
            app.quit();
          } catch (err) {
            console.error(err);
            await showError(
              "Update Error",
              "An unexpected error occurred. Check logs for details.",
            );
          }
        },
      },
      {
        enabled: false,
        label: `Version: ${currentVersion === "dev" ? "dev" : `v${currentVersion}`}`,
      },
    ],
  };

  items.splice(
    // Quit + separator
    -2,
    0,
    { type: "separator" },
    repluggedMenuItems,
  );

  return originalBuildFromTemplate(items);
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
