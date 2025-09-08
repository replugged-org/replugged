import type {
  PlaintextPatch,
  RawPlaintextPatch,
  RegexReplacement,
  WebpackModule,
} from "../../../types";
import { Logger } from "../logger";

const logger = Logger.api("plaintext-patch");

/**
 * All plaintext patches
 */
const plaintextPatches: RawPlaintextPatch[] = [];

/**
 * Parse regex for plaintext patch.
 * @param input Regex or string (Strings have no effect)
 * @returns Parsed Regex
 */
export function parseRegex<T>(input: RegExp | T): RegExp | T {
  if (input instanceof RegExp)
    return new RegExp(input.source.replaceAll("\\i", "[A-Za-z_$][\\w$]*"), input.flags);
  return input;
}

/**
 * Parse replacement for plaintext patch.
 * @param input Replacement function or string
 * @parm id Plugin ID where this is used
 * @returns Parsed Replacement
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
 * Replace a module with a plaintext-patched version.
 * @param mod Module
 * @returns Patched module
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
 * Add a plaintext patch.
 * @param patches Patch to add
 * @internal
 * @hidden
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
          source.replace(parseRegex(replacement.match), parseRegex(replacement.replace), id);
        newReplacement.regex = replacement;
        return newReplacement;
      }),
    })),
  );
}
