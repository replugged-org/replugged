import {
  database,
  generateTypeDefinitions,
  isMessageDefinitionsFile,
} from "@discord/intl-loader-core";
import chalk from "chalk";
import type { Plugin } from "esbuild";
import fs from "fs";

let isFirstRun = true;

/**
 * Rewritten for esbuild. 1:1 copy of the original plugin, except doesn't generate types during watch mode.
 * @link https://github.com/discord/discord-intl
 * @copyright 2024 Discord, Inc.
 * @license MIT
 */
export default {
  name: "intlTypeGenerator",
  setup(build) {
    const modifyGeneratedTypes = (filePath: string): void => {
      const typeFilePath = `${filePath.substring(0, filePath.length - 3)}.d.ts`;

      if (fs.existsSync(typeFilePath)) {
        let content = fs.readFileSync(typeFilePath, "utf-8");
        content = content.replace("declare const messages: {", "export declare const messages: {");
        fs.writeFileSync(typeFilePath, content);
      }
    };

    const generateTypeDefinitionsFile = (filePath: string): number => {
      const start = performance.now();
      generateTypeDefinitions(filePath, undefined);
      modifyGeneratedTypes(filePath);
      const end = performance.now();

      return end - start;
    };

    const generateAllTypes = (): void => {
      const paths = database.getAllSourceFilePaths();
      let totalDuration = 0;

      for (const path of paths) {
        if (isMessageDefinitionsFile(path)) {
          totalDuration += generateTypeDefinitionsFile(path);
        }
      }

      console.log(
        `🌍 ${chalk.green(`Updated all intl type definitions (${paths.length} files, ${totalDuration.toFixed(3)}ms)`)}`,
      );
    };

    build.onEnd(() => {
      if (isFirstRun) {
        generateAllTypes();
        isFirstRun = false;
      }
    });
  },
} as Plugin;
