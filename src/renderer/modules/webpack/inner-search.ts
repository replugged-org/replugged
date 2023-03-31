import { AnyFunction, ObjectExports } from "src/types";
import { logError } from "./util";

/**
 * Search for a function within a module by its source code.
 *
 * @param match The string or regex to match against the function's source code.
 * @param module The module to search.
 */
export function getFunctionBySource<T extends AnyFunction = AnyFunction>(
  module: ObjectExports,
  // eslint-disable-next-line @typescript-eslint/ban-types
  match: string | RegExp | ((func: Function) => boolean),
): T | undefined {
  try {
    return Object.values(module).find((v) => {
      if (typeof v !== "function") return false;

      if (typeof match === "function") {
        return match(v);
      } else {
        return typeof match === "string" ? v.toString().includes(match) : match.test(v.toString());
      }
    }) as T | undefined;
  } catch (err) {
    logError({ text: "Error in getFunctionBySource", err, module, match });
  }
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
export function getFunctionKeyBySource<P extends keyof T, T extends ObjectExports = ObjectExports>(
  module: T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  match: string | RegExp | ((func: Function) => boolean),
): P | undefined {
  try {
    return Object.entries(module).find(([_, v]) => {
      if (typeof v !== "function") return false;

      if (typeof match === "function") {
        return match(v);
      } else {
        return typeof match === "string" ? v.toString().includes(match) : match.test(v.toString());
      }
    })?.[0] as P | undefined;
  } catch (err) {
    logError({ text: "Error in getFunctionKeyBySource", err, module, match });
  }
}
