import esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const NODE_VERSION = "14";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(readFileSync(path.join(dirname, "..", "package.json"), "utf-8"));
const packageNames = Object.keys(packageJson.dependencies);

const context = await esbuild.context({
  absWorkingDir: path.join(dirname, ".."),
  bundle: true,
  minify: true,
  format: "esm",
  logLevel: "info",
  metafile: true,
  entryPoints: ["bin/index.mts"],
  platform: "node",
  target: `node${NODE_VERSION}`,
  outfile: "bin.mjs",
  external: packageNames,
});

await context.rebuild();
context.dispose();
