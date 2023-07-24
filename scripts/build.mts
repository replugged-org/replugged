import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import asar from "@electron/asar";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { logBuildPlugin } from "src/util.mjs";

const NODE_VERSION = "14";
const CHROME_VERSION = "91";

const watch = process.argv.includes("--watch");
const production = process.argv.includes("--production");

const dirname = path.dirname(fileURLToPath(import.meta.url));

const preBundle: esbuild.Plugin = {
  name: "preBundle",
  setup: (build) => {
    build.onEnd(() => {
      if (!existsSync("dist/i18n")) {
        mkdirSync("dist/i18n");
      }

      readdirSync("i18n").forEach((file) => {
        if (file.endsWith(".json")) {
          copyFileSync(`i18n/${file}`, `dist/i18n/${file}`);
        }
      });

      const mainPackage = JSON.parse(readFileSync("package.json", "utf-8"));

      writeFileSync(
        "dist/package.json",
        JSON.stringify({
          main: "main.js",
          name: "replugged",
          version: mainPackage.version,
        }),
      );
      asar.createPackage("dist", "replugged.asar");
    });
  },
};

const plugins: esbuild.Plugin[] = [];

if (!watch) plugins.push(logBuildPlugin);

if (production) {
  rmSync("dist", { recursive: true, force: true });
  plugins.push(preBundle);
} else {
  rmSync("dist/i18n", { recursive: true, force: true });
  rmSync("dist/package.json", { force: true });
}

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(dirname, ".."),
  bundle: true,
  minify: production,
  sourcemap: !production,
  format: "cjs" as esbuild.Format,
  logLevel: "info",
  plugins,
  metafile: true,
};

const contexts = await Promise.all([
  // Main
  esbuild.context({
    ...common,
    entryPoints: ["src/main/index.ts"],
    platform: "node",
    target: `node${NODE_VERSION}`,
    outfile: "dist/main.js",
    external: ["electron"],
  }),
  // Preload
  esbuild.context({
    ...common,
    entryPoints: ["src/preload.ts"],
    platform: "node",
    target: [`node${NODE_VERSION}`, `chrome${CHROME_VERSION}`],
    outfile: "dist/preload.js",
    external: ["electron"],
  }),
  // Renderer
  esbuild.context({
    ...common,
    entryPoints: ["src/renderer/index.ts"],
    platform: "browser",
    target: `chrome${CHROME_VERSION}`,
    outfile: "dist/renderer.js",
    format: "esm",
  }),
]);
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
