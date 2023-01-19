import esbuild from "esbuild";
import path from "path";
import asar from "@electron/asar";
import { copyFileSync } from "fs";

const NODE_VERSION = "14";
const CHROME_VERSION = "91";

const watch = process.argv.includes("--watch");
const production = process.argv.includes("--production");

const install: esbuild.Plugin = {
  name: "install",
  setup: (build) => {
    build.onEnd(() => {
      if (production) {
        copyFileSync("scripts/package-bundle.json", "dist/package.json");
        asar.createPackage("dist", "app.asar");
      }
    });
  },
};

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, ".."),
  bundle: true,
  minify: production,
  sourcemap: !production,
  format: "cjs" as esbuild.Format,
  logLevel: "info",
  watch,
  plugins: [install],
};

Promise.all([
  // Main
  esbuild.build({
    ...common,
    entryPoints: ["src/main/index.ts"],
    platform: "node",
    target: `node${NODE_VERSION}`,
    outfile: "dist/main.js",
    external: ["electron"],
  }),
  // Preload
  esbuild.build({
    ...common,
    entryPoints: ["src/preload.ts"],
    platform: "node",
    target: [`node${NODE_VERSION}`, `chrome${CHROME_VERSION}`],
    outfile: "dist/preload.js",
    external: ["electron"],
  }),
  // Renderer
  esbuild.build({
    ...common,
    entryPoints: ["src/renderer/index.ts"],
    platform: "browser",
    target: `chrome${CHROME_VERSION}`,
    outfile: "dist/renderer.js",
    format: "esm",
  }),
]);
