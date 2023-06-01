import type { PlaintextPatch, RawPlaintextPatch, WebpackModule } from "../../../types";

/**
 * All plaintext patches
 */
export const plaintextPatches: RawPlaintextPatch[] = [];

/**
 * Replace a module with a plaintext-patched version.
 * @param mod Module
 * @returns Patched module
 */
export function patchModuleSource(mod: WebpackModule): WebpackModule {
  const originalSource = mod.toString();

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

    const result = patch.replacements.reduce((source, patch) => patch(source), source);

    if (result === source) {
      return source;
    }

    return result;
  }, originalSource);

  if (patchedSource === originalSource) {
    return mod;
  }

  // eslint-disable-next-line no-eval
  return (0, eval)(patchedSource);
}

/**
 * Add a plaintext patch.
 * @param patches Patch to add
 * @internal
 * @hidden
 */
export function patchPlaintext(patches: PlaintextPatch[]): void {
  plaintextPatches.push(
    ...patches.map((patch) => ({
      ...patch,
      replacements: patch.replacements.map((replacement) =>
        typeof replacement === "function"
          ? replacement
          : // @ts-expect-error Why? Because https://github.com/microsoft/TypeScript/issues/14107
            (source: string) => source.replace(replacement.match, replacement.replace),
      ),
    })),
  );
}
