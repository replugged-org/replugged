import asar from "@electron/asar";
import esbuild from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { distDir } from "scripts/build.mjs";

export default {
  name: "preBundle",
  setup: (build) => {
    build.onEnd((result) => {
      if (result.errors.length > 0) return;

      const mainPackage = JSON.parse(readFileSync("package.json", "utf-8"));

      writeFileSync(
        `${distDir}/package.json`,
        JSON.stringify({
          main: "main.js",
          name: "recelled",
          version: mainPackage.version,
        }),
      );
      asar.createPackage(`${distDir}`, "recelled.asar");
    });
  },
} as esbuild.Plugin;
