const directory = process.cwd();
const asar = require("@electron/asar");
const { Parcel } = require("@parcel/core");
const {
  cpSync,
  rmSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} = require("fs");
const esbuild = require("esbuild");
const { join } = require("path");

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

function buildPlugin({ watch, noInstall, production }) {
  const manifest = require(join(directory, "./manifest.json"));
  const CHROME_VERSION = "91";
  const REPLUGGED_FOLDER_NAME = "replugged";
  const globalModules = {
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

  const CONFIG_PATH = (() => {
    switch (process.platform) {
      case "win32":
        return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
      case "darwin":
        return join(
          process.env.HOME || "",
          "Library",
          "Application Support",
          REPLUGGED_FOLDER_NAME,
        );
      default:
        if (process.env.XDG_CONFIG_HOME) {
          return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
        }
        return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
    }
  })();

  const install = {
    name: "install",
    setup: (build) => {
      build.onEnd(() => {
        if (!noInstall) {
          const dest = join(CONFIG_PATH, "plugins", manifest.id);
          if (existsSync(dest)) rmSync(dest, { recursive: true });
          cpSync("dist", dest, { recursive: true });
          console.log("Installed updated version");
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

  return Promise.all(targets);
}

function buildTheme({ watch: shouldWatch, noInstall, production }) {
  const manifest = require(join(directory, "./manifest.json"));

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
        return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
      case "darwin":
        return join(
          process.env.HOME || "",
          "Library",
          "Application Support",
          REPLUGGED_FOLDER_NAME,
        );
      default:
        if (process.env.XDG_CONFIG_HOME) {
          return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
        }
        return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
    }
  })();

  function install() {
    if (!noInstall) {
      const dest = join(CONFIG_PATH, "themes", manifest.id);
      if (existsSync(dest)) {
        rmSync(dest, { recursive: true });
      }
      cpSync("dist", dest, { recursive: true });
      console.log("Installed updated version");
    }
  }

  async function build(bundler) {
    const { bundleGraph, buildTime } = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`Built ${bundles.length} bundles in ${buildTime}ms!`);
    install();
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

  const fn = shouldWatch ? watch : build;
  const promises = [mainBundler, splashBundler].filter(Boolean).map((bundler) => fn(bundler));

  manifest.main = "main.css";
  manifest.splash = splash ? "splash.css" : undefined;

  if (!existsSync("dist")) {
    mkdirSync("dist");
  }

  writeFileSync("dist/manifest.json", JSON.stringify(manifest));

  return Promise.all(promises);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { argv } = require("yargs")
  .scriptName("replugged")
  .usage("$0 <cmd> [args]")
  .command(
    "build [addon] [--no-install] [--watch]",
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
    },
    (argv) => {
      if (argv.addon === "plugin") {
        buildPlugin(argv);
      } else if (argv.addon === "theme") {
        buildTheme(argv);
      } else {
        console.log("Invalid addon type.");
      }
    },
  )
  .command(
    "bundle [addon]",
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
    },
  )
  .parserConfiguration({
    "boolean-negation": false,
  })
  .help();
