import { createContext } from "@marshift/argus";
import esbuild from "esbuild";
import { rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import intlLoaderPlugin from "./build-plugins/intl-loader.mjs";
import intlTypeGeneratorPlugin from "./build-plugins/intl-type-generator.mjs";
import logBuildPlugin from "./build-plugins/log-build.mjs";
import preBundlePlugin from "./build-plugins/pre-bundle.mjs";

const NODE_VERSION = "20";
const CHROME_VERSION = "130";

const ctx = createContext(process.argv);
const watch = ctx.hasOptionalArg(/--watch/);
export const production = ctx.hasOptionalArg(/--production/);

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const distDir = production ? "dist-bundle" : "dist";

// Delete old builds to prevent issues/confusion from leftover files
rmSync("dist", { recursive: true, force: true });
rmSync("dist-bundle", { recursive: true, force: true });
rmSync("replugged.asar", { force: true });

const plugins: esbuild.Plugin[] = [];

if (!watch) plugins.push(logBuildPlugin);
if (production) {
  plugins.push(preBundlePlugin);
}

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(dirname, ".."),
  bundle: true,
  minify: production,
  sourcemap: !production,
  format: "cjs",
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
    outfile: `${distDir}/main.js`,
    external: ["electron", "original-fs"],
  }),
  // Preload
  esbuild.context({
    ...common,
    entryPoints: ["src/preload.ts"],
    platform: "node",
    target: [`node${NODE_VERSION}`, `chrome${CHROME_VERSION}`],
    outfile: `${distDir}/preload.js`,
    external: ["electron"],
  }),
  // Renderer
  esbuild.context({
    ...common,
    plugins: [...plugins, intlTypeGeneratorPlugin, intlLoaderPlugin()],
    entryPoints: ["src/renderer/index.ts"],
    platform: "browser",
    target: `chrome${CHROME_VERSION}`,
    outfile: `${distDir}/renderer.js`,
    format: "esm",
    loader: {
      ".png": "dataurl",
    },
  }),
]);
await Promise.all(
  contexts.map(async (context) => {
    if (watch) {
      await context.watch();
    } else {
      await context.rebuild().catch(() => process.exit(1));
      await context.dispose();
    }
  }),
);
