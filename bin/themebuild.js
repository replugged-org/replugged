#!/usr/bin/env node

const dir = process.cwd();

const { join } = require("path");
const { Parcel } = require(join(dir, "node_modules/@parcel/core"));
const { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } = require("fs");
const _manifest = require(join(dir, "./manifest.json"));

const manifest = _manifest;

const main = manifest.main || "src/main.css";
const splash = manifest.splash || (existsSync("src/splash.css") ? "src/splash.css" : undefined);

const mainBundler = new Parcel({
  entries: main,
  defaultConfig: "@parcel/config-default",
  targets: {
    main: {
      distDir: "dist",
      distEntry: "main.css",
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
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(process.env.HOME || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
  }
})();

function install() {
  if (!process.argv.includes("--no-install")) {
    const dest = join(CONFIG_PATH, "themes", manifest.id);
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true });
    }
    cpSync("dist", dest, { recursive: true });
    console.log("Installed updated version");
  }
}

async function build(bundler) {
  try {
    const { bundleGraph, buildTime } = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
    install();
  } catch (err) {
    console.log(err.diagnostics);
  }
}

async function watch(bundler) {
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

const shouldWatch = process.argv.includes("--watch");

const fn = shouldWatch ? watch : build;
[mainBundler, splashBundler].filter(Boolean).forEach((bundler) => fn(bundler));

manifest.main = "main.css";
manifest.splash = splash ? "splash.css" : undefined;

if (!existsSync("dist")) {
  mkdirSync("dist");
}

writeFileSync("dist/manifest.json", JSON.stringify(manifest));
