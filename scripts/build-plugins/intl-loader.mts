import {
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
import esbuild from "esbuild";
import { readFileSync } from "node:fs";
import { dirname, posix, relative, resolve } from "node:path";
import { production } from "scripts/build.mjs";

const FILE_PATH_SEPARATOR_MATCH = /[\\\\\\/]/g;
const INTL_MESSAGES_REGEXP = /\.messages\.(js|json|jsona)$/;

export function makePosixRelativePath(source: string, file: string): string {
  return `./${relative(dirname(source), file).replace(FILE_PATH_SEPARATOR_MATCH, posix.sep)}`;
}

let hasInitializedAllDefinitions = false;
let messageKeys: Record<string, string> = {};

/**
 * Rewritten for esbuild. 1:1 copy of the original plugin, adapted for Replugged/Recelled (doesn't hash keys).
 * @link https://github.com/discord/discord-intl
 * @copyright 2024 Discord, Inc.
 * @license MIT
 */
export default {
  name: "intlLoader",
  setup(build) {
    build.onLoad({ filter: INTL_MESSAGES_REGEXP }, (args) => {
      const sourcePath = args.path;
      const source = readFileSync(sourcePath, "utf-8");
      const forceTranslation = args.suffix === "?forceTranslation";
      const i18nPath = resolve("./i18n/");

      if (!hasInitializedAllDefinitions) {
        processAllMessagesFiles(findAllMessagesFiles([i18nPath]));
        hasInitializedAllDefinitions = true;
      }

      if (isMessageDefinitionsFile(sourcePath) && !forceTranslation) {
        const result = processDefinitionsFile(sourcePath, source, { locale: "en-US" });

        result.translationsLocaleMap[result.locale] = `${sourcePath}?forceTranslation`;
        for (const locale in result.translationsLocaleMap) {
          result.translationsLocaleMap[locale] = makePosixRelativePath(
            sourcePath,
            result.translationsLocaleMap[locale],
          );
        }

        if (Object.keys(messageKeys).length < Object.keys(result.messageKeys ?? {}).length) {
          messageKeys = result.messageKeys;
        }

        const transformedOutput = new MessageDefinitionsTransformer({
          messageKeys: Object.fromEntries(
            Object.entries(result.messageKeys).map(([_, key]) => [key, key]),
          ),
          localeMap: result.translationsLocaleMap,
          defaultLocale: result.locale,
          getTranslationImport: (importPath) => `import("${importPath}")`,
          debug: !production,
        }).getOutput();

        return {
          contents: transformedOutput,
          loader: "js",
        };
      } else {
        const locale = forceTranslation ? "en-US" : getLocaleFromTranslationsFileName(sourcePath);
        if (isMessageTranslationsFile(sourcePath)) {
          processTranslationsFile(sourcePath, source, { locale });
        } else if (forceTranslation) {
        } else {
          throw new Error(
            "Expected a translation file or the `forceTranslation` query parameter on this import, but none was found",
          );
        }

        const compiledResult = precompileFileForLocale(sourcePath, locale, undefined, {
          format: IntlCompiledMessageFormat.KeylessJson,
          bundleSecrets: false,
        });
        const patchedResult = Object.fromEntries(
          Object.entries(JSON.parse(compiledResult?.toString() ?? "{}")).map(([hash, string]) => [
            messageKeys[hash],
            string,
          ]),
        );

        return {
          contents: `export default JSON.parse(\`${JSON.stringify(patchedResult).replace(/\\/g, "\\\\")}\`)`,
          loader: "js",
        };
      }
    });
  },
} as esbuild.Plugin;
