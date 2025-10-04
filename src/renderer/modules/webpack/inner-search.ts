import type { UnknownFunction } from "src/types";
import { parseRegex } from "./plaintext-patch";

function findFunctionEntryBySource<T>(
  module: T,
  match: string | RegExp | ((func: UnknownFunction) => boolean),
  componentSearch = false,
): [Extract<keyof T, string>, T[Extract<keyof T, string>]] | undefined {
  if (typeof module === "object" && module !== null) {
    for (const k in module) {
      try {
        // This could throw an error, hence the try-catch
        let v: unknown = module[k];

        // unwrap React.memo / React.forwardRef wrappers
        if (componentSearch) {
          while (typeof v === "object" && v !== null) {
            const obj = v as Record<string, unknown>;

            if (!obj.$$typeof) break;

            if (typeof obj.type === "function") {
              v = obj.type;
            } else if (typeof obj.render === "function") {
              v = obj.render;
            } else {
              break;
            }
          }
        }

        if (typeof v === "function") {
          let isSourceMatch = false;

          switch (typeof match) {
            case "function":
              isSourceMatch = match(v as UnknownFunction);
              break;
            case "string":
              isSourceMatch = v.toString().includes(match);
              break;
            default:
              isSourceMatch = parseRegex(match).test(v.toString());
          }

          if (isSourceMatch) {
            return [k, module[k]];
          }
        }
      } catch {}
    }
  }
}

/**
 * Retrieves a function from a module by searching its source code for a specific match.
 * @template T The expected type of the function to be returned.
 * @param module The module to search within. This can be any object or structure containing functions.
 * @param match The pattern to match the function's source code.
 * @returns The first function that matches the given pattern, or `undefined` if no match is found.
 */
export function getFunctionBySource<T>(
  module: unknown,
  match: string | RegExp | ((func: UnknownFunction) => boolean),
): T | undefined {
  return findFunctionEntryBySource(module, match)?.[1];
}

/**
 * Retrieves the key of a function within a module that matches a given source pattern.
 * @template T The type of the module object.
 * @param module The module object to search within.
 * @param match The pattern to match the function's source code.
 * @returns The key of the matching function as a string, or `undefined` if no match is found.
 */
export function getFunctionKeyBySource<T>(
  module: T,
  match: string | RegExp | ((func: UnknownFunction) => boolean),
): Extract<keyof T, string> | undefined {
  return findFunctionEntryBySource<T>(module, match)?.[0];
}

/**
 * Retrieves a component from a module by searching its source code for a specific match.
 * Can search for normal components as well as those wrapped in `React.memo` or `React.forwardRef`.
 * @template T The expected type of the component to be returned.
 * @param module The module to search within.
 * @param match The pattern to match the source against.
 * @returns The first component that matches the given pattern, or `undefined` if no match is found.
 */
export function getComponentBySource<T>(
  module: unknown,
  match: string | RegExp | ((func: UnknownFunction) => boolean),
): T | undefined {
  return findFunctionEntryBySource(module, match, true)?.[1];
}
