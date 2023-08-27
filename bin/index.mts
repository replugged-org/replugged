#!/usr/bin/env node
import asar from "@electron/asar";
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
import yargs, { ArgumentsCamelCase } from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import WebSocket from "ws";
import { release } from "./release.mjs";
import { logBuildPlugin } from "../src/util.mjs";
import { sassPlugin } from "esbuild-sass-plugin";
import { fileURLToPath } from "url";

interface BaseArgs {
  watch?: boolean;
  noInstall?: boolean;
  production?: boolean;
  noReload?: boolean;
}

type Args = ArgumentsCamelCase<BaseArgs> | BaseArgs;

const directory = process.cwd();
const manifestPath = path.join(directory, "manifest.json");

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(path.resolve(dirname, "package.json"), "utf-8"));

const updateMessage = `Update available ${chalk.dim("{currentVersion}")}${chalk.reset(
  " → ",
)}${chalk.green("{latestVersion}")} \nRun ${chalk.cyan("pnpm i -D replugged")} to update`;

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

function sendUpdateNotification(): void {
  notifier.notify({
    message: updateMessage,
  });
}

const MIN_PORT = 6463;
const MAX_PORT = 6472;

function random(): string {
  return Math.random().toString(16).slice(2);
}

let ws: WebSocket | undefined;
let failed = false;
let connectingPromise: Promise<WebSocket | undefined> | undefined;

/**
 * Try to connect to RPC on a specific port and handle the READY event as well as errors and close events
 */
function tryPort(port: number): Promise<WebSocket | undefined> {
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
async function connectWebsocket(): Promise<WebSocket | null | undefined> {
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
 */
async function reload(id: string): Promise<void> {
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
    const onMessage = async (data: string): Promise<void> => {
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

async function bundleAddon(buildFn: (args: Args) => Promise<void>): Promise<void> {
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

async function handleContexts(
  contexts: esbuild.BuildContext[],
  watch: boolean | undefined,
): Promise<void> {
  await Promise.all(
    contexts.map(async (context) => {
      if (watch) {
        await context.watch();
      } else {
        await context.rebuild().catch(() => {});
        context.dispose();
      }
    }),
  );
}

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
const CHROME_VERSION = "91";

async function buildPlugin({ watch, noInstall, production, noReload }: Args): Promise<void> {
  let manifest = JSON.parse(readFileSync(manifestPath.toString(), "utf-8"));
  const globalModules: esbuild.Plugin = {
    name: "globalModules",
    setup: (build) => {
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

  const install: esbuild.Plugin = {
    name: "install",
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

  const plugins: esbuild.Plugin[] = [globalModules, install];
  if (watch) plugins.push(logBuildPlugin);

  const common: esbuild.BuildOptions = {
    absWorkingDir: directory,
    bundle: true,
    format: "esm",
    logLevel: "info",
    minify: production,
    platform: "browser",
    plugins,
    sourcemap: !production,
    target: `chrome${CHROME_VERSION}`,
  };

  const targets: Array<Promise<esbuild.BuildContext>> = [];

  if ("renderer" in manifest) {
    targets.push(
      esbuild.context({
        ...common,
        entryPoints: [manifest.renderer],
        outfile: "dist/renderer.js",
      }),
    );

    manifest.renderer = "renderer.js";
  }

  if ("plaintextPatches" in manifest) {
    targets.push(
      esbuild.context({
        ...common,
        entryPoints: [manifest.plaintextPatches],
        outfile: "dist/plaintextPatches.js",
      }),
    );

    manifest.plaintextPatches = "plaintextPatches.js";
  }

  if (!existsSync("dist")) mkdirSync("dist");

  writeFileSync("dist/manifest.json", JSON.stringify(manifest));

  const contexts = await Promise.all(targets);
  await handleContexts(contexts, watch);

  ws?.close();
}

async function buildTheme({ watch, noInstall, production, noReload }: Args): Promise<void> {
  let manifest = JSON.parse(readFileSync(manifestPath.toString(), "utf-8"));

  const main = manifest.main || "src/main.css";
  const splash = manifest.splash || (existsSync("src/splash.css") ? "src/splash.css" : undefined);

  const install: esbuild.Plugin = {
    name: "install",
    setup: (build) => {
      build.onEnd(async () => {
        if (!noInstall) {
          const dest = path.join(CONFIG_PATH, "themes", manifest.id);
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

  const plugins: esbuild.Plugin[] = [sassPlugin(), install];
  if (watch) plugins.push(logBuildPlugin);

  const common: esbuild.BuildOptions = {
    absWorkingDir: directory,
    bundle: true,
    format: "esm",
    logLevel: "info",
    minify: production,
    platform: "browser",
    plugins,
    sourcemap: !production,
    target: `chrome${CHROME_VERSION}`,
  };

  const targets: Array<Promise<esbuild.BuildContext>> = [];

  if (main) {
    targets.push(
      esbuild.context({
        ...common,
        entryPoints: [main],
        outfile: "dist/main.css",
      }),
    );

    manifest.main = "main.css";
  }

  if (splash) {
    targets.push(
      esbuild.context({
        ...common,
        entryPoints: [splash],
        outfile: "dist/splash.css",
      }),
    );

    manifest.plaintextPatches = "splash.css";
  }

  if (!existsSync("dist")) mkdirSync("dist");

  writeFileSync("dist/manifest.json", JSON.stringify(manifest));

  const contexts = await Promise.all(targets);
  await handleContexts(contexts, watch);

  ws?.close();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        buildPlugin(argv);
      } else if (argv.addon === "theme") {
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
