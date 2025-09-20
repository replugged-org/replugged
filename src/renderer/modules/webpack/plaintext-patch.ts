import type { PlaintextPatch, RawPlaintextPatch, RegexReplacement, WebpackModule } from "src/types";
import { Logger } from "../logger";

const logger = Logger.api("plaintext-patch");

const plaintextPatches: RawPlaintextPatch[] = [];

/**
 * Module ID is the key
 * With value as ids of addons/coremods that patch the module
 * This is better than keeping the whole keeping patched module as string
 */
export const PatchIds: Record<string, string[] | undefined> = {};

/**
 * Parses a given input and, if it is a regular expression, replaces all occurrences.
 * of the custom `\i` pattern with a regex pattern that matches valid identifier names.
 * @param input The input to parse.
 * @returns A new `RegExp` with the `\i` pattern replaced, or the original input if it is not a `RegExp`
 */
export function parseRegex<T>(input: RegExp | T): RegExp | T {
  if (input instanceof RegExp)
    return new RegExp(input.source.replaceAll("\\i", "[A-Za-z_$][\\w$]*"), input.flags);
  return input;
}

/**
 * Parses and replaces occurrences of the `$exports` placeholder in the provided input.
 * with a string referencing the exports of a plugin identified by the given `id`.
 * @param input The replacement input.
 * @param id The ID of the plugin whose exports are being referenced.
 * @returns The processed replacement input with `$exports` replaced by the appropriate plugin exports reference.
 */
export function parseReplace(
  input: RegexReplacement["replace"],
  id: string,
): RegexReplacement["replace"] {
  if (typeof input === "function")
    return (...args): string =>
      input(...args).replaceAll("$exports", `replugged.plugins.getExports("${id}")`);
  return input.replaceAll("$exports", `replugged.plugins.getExports("${id}")`);
}

/**
 * Applies a series of plaintext patches to a Webpack module's source code.
 * @param mod The Webpack module to be patched.
 * @param id The unique identifier of the module being patched.
 * @returns The patched Webpack module if modifications were made, otherwise the original module.
 * @throws {Error} Will throw an error if there is a syntax error in the patched source code during evaluation.
 * @internal
 */
export function patchModuleSource(mod: WebpackModule, id: string): WebpackModule {
  const originalSource = mod.toString();

  const patchedBy: string[] = [];

  const patchedSource = plaintextPatches.reduce((source, patch) => {
    if (
      patch.find &&
      !(typeof patch.find === "string" ? source.includes(patch.find) : patch.find.test(source))
    ) {
      return source;
    }

    if (patch.check && !patch.check(source)) {
      return source;
    }

    const result = patch.replacements.reduce((source, patcher) => {
      const result = patcher(source);
      // Log a warning if the replacement had no effect and was intended for a specific module
      if (patch.warn && (patch.find || patch.check) && result === source)
        logger.warn(`Plaintext patch had no effect (Addon ID: ${patch.id}, Module ID: ${id})`, {
          find: patch.find,
          check: patch.check,
          replacement: patcher.regex ?? patcher,
        });
      return result;
    }, source);

    if (result === source) {
      return source;
    }
    patchedBy.push(patch.id);
    return result;
  }, originalSource);

  if (patchedSource === originalSource) {
    return mod;
  }
  PatchIds[id] = patchedBy;
  try {
    // eslint-disable-next-line no-eval
    return (0, eval)(
      `${
        patchedSource.startsWith("function(") ? `0,${patchedSource}` : patchedSource
      }\n// Patched by: ${patchedBy.filter(Boolean).join(", ")}\n//# sourceURL=${window.location.origin}/assets/patched/PatchedWebpack-${id}`,
    );
  } catch (err) {
    logger.error(`PatchedWebpack-${id}`, err);
    // Syntax error in patched module--fail
    return mod;
  }
}

/**
 * Adds plaintext patches to be applied to Webpack modules.
 * @param patches An array of plaintext patches to be applied.
 * @param id A unique identifier for the set of patches being applied.
 * @internal
 */
export function patchPlaintext(patches: PlaintextPatch[], id: string): void {
  plaintextPatches.push(
    ...patches.map((patch) => ({
      ...patch,
      find: parseRegex(patch.find),
      id,
      warn: patch.warn ?? true,
      replacements: patch.replacements.map((replacement) => {
        if (typeof replacement === "function") return replacement;
        const newReplacement = (source: string): string =>
          // @ts-expect-error Why? Because https://github.com/microsoft/TypeScript/issues/14107
          source.replace(parseRegex(replacement.match), parseReplace(replacement.replace, id));
        newReplacement.regex = replacement;
        return newReplacement;
      }),
    })),
  );
}
