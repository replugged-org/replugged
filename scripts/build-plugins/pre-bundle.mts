import { createPackage } from "@electron/asar";
import type { Plugin } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { distDir } from "scripts/build.mjs";

const isNightly = process.env.BUILD_BRANCH === "nightly";

export default {
  name: "preBundle",
  setup: (build) => {
    build.onEnd((result) => {
      if (result.errors.length > 0) return;

      const mainPackage = JSON.parse(readFileSync("package.json", "utf-8"));

      const version = isNightly
        ? `${mainPackage.version}-${process.env.GIT_HASH}`
        : mainPackage.version;

      writeFileSync(
        `${distDir}/package.json`,
        JSON.stringify({
          main: "main.js",
          name: "replugged",
          version,
        }),
      );
      void createPackage(distDir, "replugged.asar");
    });
  },
} as Plugin;
