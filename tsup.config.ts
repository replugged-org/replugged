import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    injector: "./injectors/index.ts",
    patcher: "./src/patcher.js",
    preload: "./src/preload.js",
    preloadSplash: "./src/preloadSplash.ts",
    style: "./src/Powercord/managers/style.css",
  },
  outDir: "dist",
  clean: true,
  external: ["electron"],
  noExternal: ["fix-path"],
  loader: {
    ".pem": "file",
  },
});
