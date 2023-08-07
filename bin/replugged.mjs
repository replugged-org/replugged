#!/usr/bin/env node

import asar from "@electron/asar";
import { Parcel } from "@parcel/core";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import esbuild from "esbuild";
import path from "path";
import updateNotifier from "update-notifier";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import WebSocket from "ws";
import { fileURLToPath, pathToFileURL } from "url";
import { release } from "./release.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const directory = process.cwd();
const manifestPath = pathToFileURL(path.join(directory, "manifest.json"));

const packageJson = JSON.parse(readFileSync(path.resolve(dirname, "../package.json"), "utf-8"));

const updateMessage = `Update available ${chalk.dim("{currentVersion}")}${chalk.reset(
  " → ",
)}${chalk.green("{latestVersion}")} \nRun ${chalk.cyan("pnpm i -D replugged")} to update`;

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

function sendUpdateNotification() {
  notifier.notify({
    message: updateMessage,
  });
}

const MIN_PORT = 6463;
const MAX_PORT = 6472;

function random() {
  return Math.random().toString(16).slice(2);
}

/**
 * @type {WebSocket | undefined}
 */
let ws;
let failed = false;
/**
 * @type {Promise<WebSocket | undefined> | undefined}
 */
let connectingPromise;

/**
 * Try to connect to RPC on a specific port and handle the READY event as well as errors and close events
 * @param {number} port
 */
function tryPort(port) {
  ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=REPLUGGED-${random()}`);
  return new Promise((resolve, reject) => {
    let didFinish = false;
    ws?.on("message", (data) => {
      if (didFinish) {
        return;
      }

      const message = JSON.parse(data.toString());
      if (message.evt !== "READY") {
        return;
      }

      didFinish = true;

      resolve(ws);
    });
    ws?.on("error", () => {
      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WebSocket error"));
    });
    ws?.on("close", () => {
      ws = undefined;

      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WebSocket closed"));
    });
  });
}

/**
 * Get an active websocket connection to Discord. If one is already open, it will be returned. Otherwise, a new connection will be made.
 * If a connection cannot be made or failed previously, none will be made and undefined will be returned.
 */
async function connectWebsocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }
  if (failed) return null;
  if (connectingPromise) return await connectingPromise;

  connectingPromise = (async () => {
    for (let port = MIN_PORT; port <= MAX_PORT; port++) {
      try {
        ws = await tryPort(port);
        return ws;
      } catch {}
    }
    return undefined;
  })();

  const result = await connectingPromise;
  connectingPromise = undefined;
  if (result) {
    return result;
  }

  console.error("Could not connect to Discord websocket");
  failed = true;
  return undefined;
}

let reloading = false;
let reloadAgain = false;

/**
 * Send WS request to reload an addon
 * @param {string} id
 */
async function reload(id) {
  const ws = await connectWebsocket();
  if (!ws) return;

  if (reloading) {
    reloadAgain = true;
    return;
  }

  const nonce = random();

  ws.send(
    JSON.stringify({
      cmd: "REPLUGGED_ADDON_WATCHER",
      args: {
        id,
      },
      nonce,
    }),
  );

  reloading = true;

  await new Promise((resolve) => {
    /**
     *
     * @param {import('ws').RawData} data
     * @returns
     */
    const onMessage = async (data) => {
      const message = JSON.parse(data.toString());
      if (message.nonce !== nonce) {
        return;
      }
      ws.off("message", onMessage);

      reloading = false;
      if (reloadAgain) {
        reloadAgain = false;
        resolve(await reload(id));
        return;
      }

      if (message.data.success) {
        console.log("Reloaded addon");
        resolve(undefined);
      } else {
        const errorCode = message.data.error;
        let error = "Unknown error";
        switch (errorCode) {
          case "ADDON_NOT_FOUND":
            error = "Addon not found";
            break;
          case "ADDON_DISABLED":
            error = "Addon disabled";
            break;
          case "RELOAD_FAILED":
            error = "Reload failed";
            break;
        }
        console.error(`Failed to reload addon: ${error}`);
        resolve(undefined);
      }
    };

    ws.on("message", onMessage);
  });
}

/**
 * @typedef Args
 * @property {boolean} [watch]
 * @property {boolean} [noInstall]
 * @property {boolean} [production]
 * @property {boolean} [noReload]
 */

/**
 * @param {(args: Args) => Promise<void>} buildFn
 */
async function bundleAddon(buildFn) {
  if (existsSync("dist")) {
    rmSync("dist", { recursive: true });
  }
  await buildFn({ watch: false, noInstall: true, production: true });

  const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf-8"));
  const outputName = `bundle/${manifest.id}`;

  if (!existsSync("bundle")) {
    mkdirSync("bundle");
  }
  asar.createPackage("dist", `${outputName}.asar`);
  copyFileSync("dist/manifest.json", `${outputName}.json`);

  console.log(`Bundled ${manifest.name}`);
}

/**
 * @param {Args} args
 */
async function buildPlugin({ watch, noInstall, production, noReload }) {
  // @ts-expect-error
  let manifest = await import(manifestPath.toString(), {
    assert: { type: "json" },
  });
  if ("default" in manifest) manifest = manifest.default;
  const CHROME_VERSION = "91";
  const REPLUGGED_FOLDER_NAME = "replugged";
  const globalModules = {
    name: "globalModules",
    // @ts-expect-error
    setup: (build) => {
      // @ts-expect-error
      build.onResolve({ filter: /^replugged.+$/ }, (args) => {
        if (args.kind !== "import-statement") return undefined;

        return {
          errors: [
            {
              text: `Importing from a path (${args.path}) is not supported. Instead, please import from "replugged" and destructure the required modules.`,
            },
          ],
        };
      });

      // @ts-expect-error
      build.onResolve({ filter: /^replugged$/ }, (args) => {
        if (args.kind !== "import-statement") return undefined;

        return {
          path: args.path,
          namespace: "replugged",
        };
      });

      build.onLoad(
        {
          filter: /.*/,
          namespace: "replugged",
        },
        () => {
          return {
            contents: "module.exports = window.replugged",
          };
        },
      );
    },
  };

  const CONFIG_PATH = (() => {
    switch (process.platform) {
      case "win32":
        return path.join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
      case "darwin":
        return path.join(
          process.env.HOME || "",
          "Library",
          "Application Support",
          REPLUGGED_FOLDER_NAME,
        );
      default:
        if (process.env.XDG_CONFIG_HOME) {
          return path.join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
        }
        return path.join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
    }
  })();

  const install = {
    name: "install",
    // @ts-expect-error
    setup: (build) => {
      build.onEnd(async () => {
        if (!noInstall) {
          const dest = path.join(CONFIG_PATH, "plugins", manifest.id);
          if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
          cpSync("dist", dest, { recursive: true });
          console.log("Installed updated version");

          if (!noReload) {
            await reload(manifest.id);
          }
        }
      });
    },
  };

  const common = {
    absWorkingDir: directory,
    bundle: true,
    format: "esm",
    logLevel: "info",
    minify: production,
    platform: "browser",
    plugins: [globalModules, install],
    sourcemap: !production,
    target: `chrome${CHROME_VERSION}`,
    watch,
  };

  const targets = [];

  if ("renderer" in manifest) {
    targets.push(
      // @ts-expect-error
      esbuild.build({
        ...common,
        entryPoints: [manifest.renderer],
        outfile: "dist/renderer.js",
      }),
    );

    manifest.renderer = "renderer.js";
  }

  if ("plaintextPatches" in manifest) {
    targets.push(
      // @ts-expect-error
      esbuild.build({
        ...common,
        entryPoints: [manifest.plaintextPatches],
        outfile: "dist/plaintextPatches.js",
      }),
    );

    manifest.plaintextPatches = "plaintextPatches.js";
  }

  if (!existsSync("dist")) mkdirSync("dist");

  writeFileSync("dist/manifest.json", JSON.stringify(manifest));

  await Promise.all(targets);

  ws?.close();
}

/**
 * @param {Args} args
 */
async function buildTheme({ watch: shouldWatch, noInstall, production, noReload }) {
  // @ts-expect-error
  let manifest = await import(manifestPath, {
    assert: { type: "json" },
  });
  if ("default" in manifest) manifest = manifest.default;

  const main = manifest.main || "src/main.css";
  const splash = manifest.splash || (existsSync("src/splash.css") ? "src/splash.css" : undefined);

  const mainBundler = new Parcel({
    entries: main,
    defaultConfig: "@parcel/config-default",
    targets: {
      main: {
        distDir: "dist",
        distEntry: "main.css",
        sourceMap: !production,
        optimize: production,
      },
    },
  });

  const splashBundler = splash
    ? new Parcel({
        entries: splash,
        defaultConfig: "@parcel/config-default",
        targets: {
          main: {
            distDir: "dist",
            distEntry: "splash.css",
          },
        },
      })
    : undefined;

  const REPLUGGED_FOLDER_NAME = "replugged";
  const CONFIG_PATH = (() => {
    switch (process.platform) {
      case "win32":
        return path.join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
      case "darwin":
        return path.join(
          process.env.HOME || "",
          "Library",
          "Application Support",
          REPLUGGED_FOLDER_NAME,
        );
      default:
        if (process.env.XDG_CONFIG_HOME) {
          return path.join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
        }
        return path.join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
    }
  })();

  async function install() {
    if (!noInstall) {
      const dest = path.join(CONFIG_PATH, "themes", manifest.id);
      if (existsSync(dest)) {
        rmSync(dest, { recursive: true, force: true });
      }
      cpSync("dist", dest, { recursive: true });
      console.log("Installed updated version");

      if (!noReload) {
        // @ts-expect-error
        await reload(manifest.id, watch);
      }
    }
  }

  // @ts-expect-error
  async function build(bundler) {
    const { bundleGraph, buildTime } = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`Built ${bundles.length} bundles in ${buildTime}ms!`);
    install();
  }

  // @ts-expect-error
  async function watch(bundler) {
    // @ts-expect-error
    await bundler.watch((err, event) => {
      if (err) {
        // fatal error
        throw err;
      }
      if (!event) return;

      if (event.type === "buildSuccess") {
        let bundles = event.bundleGraph.getBundles();
        console.log(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
        install();
      } else if (event.type === "buildFailure") {
        console.log(event.diagnostics);
      }
    });
  }

  const fn = shouldWatch ? watch : build;
  const promises = [mainBundler, splashBundler].filter(Boolean).map((bundler) => fn(bundler));

  manifest.main = "main.css";
  manifest.splash = splash ? "splash.css" : undefined;

  if (!existsSync("dist")) {
    mkdirSync("dist");
  }

  writeFileSync("dist/manifest.json", JSON.stringify(manifest));

  await Promise.all(promises);

  ws?.close();
}

// eslint-disable-next-line no-unused-vars
const { argv } = yargs(hideBin(process.argv))
  .scriptName("replugged")
  .usage("$0 <cmd> [args]")
  .command(
    "build <addon>",
    "Build an Addon",
    (yargs) => {
      yargs.positional("addon", {
        type: "string",
        describe: "Either a plugin or theme",
      });
      yargs.option("no-install", {
        type: "boolean",
        describe: "Don't install the built addon",
        default: false,
      });
      yargs.option("watch", {
        type: "boolean",
        describe: "Watch the addon for changes to reload building",
        default: false,
      });
      yargs.option("production", {
        type: "boolean",
        describe: "Don't compile the source maps when building.",
        default: false,
      });
      yargs.option("no-reload", {
        type: "boolean",
        describe: "Don't reload the addon in Discord after building.",
        default: false,
      });
    },
    (argv) => {
      if (argv.addon === "plugin") {
        // @ts-expect-error
        buildPlugin(argv);
      } else if (argv.addon === "theme") {
        // @ts-expect-error
        buildTheme(argv);
      } else {
        console.log("Invalid addon type.");
      }
      sendUpdateNotification();
    },
  )
  .command(
    "bundle <addon>",
    "Bundle any Addon",
    (yargs) => {
      yargs.positional("addon", {
        type: "string",
        describe: "Either a plugin or theme",
      });
    },
    (argv) => {
      if (argv.addon === "plugin") {
        bundleAddon(buildPlugin);
      } else if (argv.addon === "theme") {
        bundleAddon(buildTheme);
      } else {
        console.log("Invalid addon type.");
      }
      sendUpdateNotification();
    },
  )
  .command("release", "Interactively release a new version of an addon", () => {}, release)
  .parserConfiguration({
    "boolean-negation": false,
  })
  .help();
