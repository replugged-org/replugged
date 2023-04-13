/**
 * Get a function in a module to inject into.
 * @param module Module
 * @param match Source criterion
 * @returns Entry for the found function (key and value)
 */
function findFunctionEntryBySource<T>(
  module: T,
  match: string | RegExp | ((func: unknown) => boolean),
): [Extract<keyof T, string>, T[Extract<keyof T, string>]] | undefined {
  if (typeof module === "object" && module !== null) {
    for (const k in module) {
      try {
        // This could throw an error, hence the try-catch
        const v = module[k];
        if (typeof v === "function") {
          let isSourceMatch = false;
          switch (typeof match) {
            case "function":
              isSourceMatch = match(v);
              break;
            case "string":
              isSourceMatch = v.toString().includes(match);
              break;
            default:
              isSourceMatch = match.test(v.toString());
          }
          if (isSourceMatch) return [k, v];
        }
      } catch {}
    }
  }
}

/**
 * Search for a function within a module by its source code.
 *
 * @param match The string or regex to match against the function's source code.
 * @param module The module to search.
 */
export function getFunctionBySource<T>(
  module: T,
  match: string | RegExp | ((func: unknown) => boolean),
): T[Extract<keyof T, string>] | undefined {
  return findFunctionEntryBySource(module, match)?.[1];
}

/**
 * Search for a function within a module by its source code. Returns the key of the function.
 *
 * @param match The string or regex to match against the function's source code.
 * @param module The module to search.
 *
 * @remarks
 * Useful for getting the prop name to inject into.
 */
export function getFunctionKeyBySource<T>(
  module: T,
  match: string | RegExp | ((func: unknown) => boolean),
): Extract<keyof T, string> | undefined {
  return findFunctionEntryBySource<T>(module, match)?.[0];
}
