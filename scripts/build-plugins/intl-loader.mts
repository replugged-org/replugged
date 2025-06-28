import {
  // @ts-expect-error: ts doesn't like that this is a const enum
  IntlCompiledMessageFormat,
  MessageDefinitionsTransformer,
  findAllMessagesFiles,
  getLocaleFromTranslationsFileName,
  isMessageDefinitionsFile,
  isMessageTranslationsFile,
  precompileFileForLocale,
  processAllMessagesFiles,
  processDefinitionsFile,
  processTranslationsFile,
} from "@discord/intl-loader-core";
import type { Plugin } from "esbuild";
import { readFileSync } from "node:fs";
import { dirname, posix, relative } from "node:path";
import { production } from "scripts/build.mjs";

const FILE_PATH_SEPARATOR_MATCH = /[\\\\\\/]/g;
const INTL_MESSAGES_REGEXP = /\.messages\.(js|json|jsona)$/;

export function makePosixRelativePath(source: string, file: string): string {
  return `./${relative(dirname(source), file).replace(FILE_PATH_SEPARATOR_MATCH, posix.sep)}`;
}

let hasInitializedAllDefinitions = false;
let messageKeys: Record<string, string> = {};

interface IntlLoaderOptions {
  format?: IntlCompiledMessageFormat;
  bundleSecrets?: boolean;
  bindMode?: "proxy" | "literal";
  watchFolders?: string[];
  sourceLocale?: string;
}

/**
 * Rewritten for esbuild. 1:1 copy of the original plugin, adapted for Replugged (doesn't hash keys).
 * @link https://github.com/discord/discord-intl
 * @copyright 2024 Discord, Inc.
 * @license MIT
 */
export default (options: IntlLoaderOptions = {}): Plugin => ({
  name: "intlLoader",
  setup(build) {
    build.onLoad({ filter: INTL_MESSAGES_REGEXP }, (args) => {
      const sourcePath = args.path;
      const source = readFileSync(sourcePath, "utf-8");
      const forceTranslation = args.suffix === "?forceTranslation";
      const {
        bundleSecrets = false,
        // @ts-expect-error: ts doesn't like that this is a const enum
        format = IntlCompiledMessageFormat.KeylessJson,
        bindMode = "proxy",
        watchFolders = [process.cwd()],
        sourceLocale = "en-US",
      } = options;

      if (!hasInitializedAllDefinitions) {
        processAllMessagesFiles(findAllMessagesFiles(watchFolders));
        hasInitializedAllDefinitions = true;
      }

      if (isMessageDefinitionsFile(sourcePath) && !forceTranslation) {
        const result = processDefinitionsFile(sourcePath, source, { locale: sourceLocale });
        if (!result.succeeded) throw new Error(result.errors[0].message);

        result.translationsLocaleMap[result.locale] = `${sourcePath}?forceTranslation`;
        for (const locale in result.translationsLocaleMap) {
          result.translationsLocaleMap[locale] = makePosixRelativePath(
            sourcePath,
            result.translationsLocaleMap[locale],
          );
        }

        messageKeys = result.messageKeys;

        const transformedOutput = new MessageDefinitionsTransformer({
          messageKeys: Object.fromEntries(
            Object.entries(result.messageKeys).map(([_, key]) => [key, key]),
          ),
          localeMap: result.translationsLocaleMap,
          defaultLocale: result.locale,
          getTranslationImport: (importPath) => `import("${importPath}")`,
          debug: !production,
          bindMode,
          getPrelude: () => `import {waitForProps} from '@webpack';`,
        }).getOutput();

        return {
          // This has been made to not block the loading of Replugged
          // by changing the transformed output to a function that
          // loads the messages when the IntlManager is loaded.
          contents: transformedOutput
            .replace(
              /const {createLoader} = require\('@discord\/intl'\);/,
              "let messagesLoader,messages;waitForProps('createLoader','IntlManager').then(({createLoader,makeMessagesProxy})=>{",
            )
            .replace(/const {makeMessagesProxy} = require\('@discord\/intl'\);/, "")
            .replace("const messagesLoader", "messagesLoader")
            .replace("const binds", "messages")
            .replace("export {messagesLoader};", "});export {messagesLoader,messages};")
            .replace("export default binds;", ""),
          loader: "js",
        };
      } else {
        const locale = forceTranslation ? "en-US" : getLocaleFromTranslationsFileName(sourcePath);
        if (isMessageTranslationsFile(sourcePath)) {
          const result = processTranslationsFile(sourcePath, source, { locale });
          if (!result.succeeded) throw new Error(result.errors[0].message);
        } else if (forceTranslation) {
          /* empty */
        } else {
          throw new Error(
            "Expected a translation file or the `forceTranslation` query parameter on this import, but none was found",
          );
        }

        const compiledResult = precompileFileForLocale(sourcePath, locale, undefined, {
          format,
          bundleSecrets,
        });
        const parsedMessage: Record<string, unknown> = JSON.parse(
          compiledResult?.toString() ?? "{}",
        );
        const patchedResult = Object.fromEntries(
          Object.entries(parsedMessage).map(([hash, string]) => [messageKeys[hash], string]),
        );

        return {
          contents: `export default JSON.parse(\`${JSON.stringify(patchedResult).replace(/\\/g, "\\\\")}\`)`,
          loader: "js",
        };
      }
    });
  },
});
