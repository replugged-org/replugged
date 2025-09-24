import type { Filter, GetModuleOptions, RawModule } from "src/types";
import { webpackChunks, wpRequire } from "./patch-load";
import { logError } from "./util";

// Export-finding utilities

/**
 * Retrieves the exported value from a module, attempting to resolve specific keys
 * ("default", "Z", "ZP") if the module's exports object contains only one key.
 * @template T The expected type of the exported value.
 * @param m The raw module from which to retrieve the exports.
 * @returns The exported value, or `undefined` if the exports are not an object or if no suitable key is found.
 * @internal
 */
export function getExports<T>(m: RawModule): T | undefined {
  if (typeof m.exports === "object" && m.exports) {
    if (Object.keys(m.exports).length === 1) {
      for (const key of ["default", "Z", "ZP"] as const) {
        if (key in m.exports) return (m.exports as Record<typeof key, T>)[key];
      }
    }
  }
  return m.exports as T | undefined;
}

function* iterateModuleExports(
  m: unknown,
  secondLevel?: boolean,
): IterableIterator<[string | null, Record<PropertyKey, unknown>]> {
  // if m is null or not an object/function, then it will obviously not have the props
  // if it has no props, then it definitely has no children either
  try {
    if (m && (typeof m === "object" || typeof m === "function")) {
      yield [null, m as Record<PropertyKey, unknown>];
      for (const key in m) {
        // This could throw an error ("illegal invocation") if val === DOMTokenList.prototype
        // and key === "length"
        // There could be other cases too, hence this try-catch instead of a specific exclusion
        const val = (m as Record<PropertyKey, unknown>)[key];
        if (val && (typeof val === "object" || typeof val === "function")) {
          yield [key, val as Record<PropertyKey, unknown>];
          if (secondLevel && typeof val === "object") {
            for (const subKey in val) {
              const subVal = (val as Record<PropertyKey, unknown>)[subKey];
              if (subVal && (typeof subVal === "object" || typeof subVal === "function")) {
                yield [subKey, subVal as Record<PropertyKey, unknown>];
                continue;
              }
            }
          }
        }
      }
    }
  } catch {}
}

/**
 * Retrieves the first export from a module that contains all the specified properties.
 * @template T The expected type of the export that matches the specified properties.
 * @template P The type of the property keys to look for.
 * @param m The module to search through.
 * @param props An array of property keys to look for in the exports.
 * @param byPrototype Whether to search only in the prototype of the exports. Defaults to `false`.
 * @returns The first export that contains all the specified properties, or `undefined` if none is found.
 */
export function getExportsForProps<T, P extends PropertyKey = keyof T>(
  m: unknown,
  props: P[],
  byPrototype?: boolean,
): T | undefined {
  // Loop over the module and its exports at the top level
  // Return the first thing that has all the indicated props
  // Checks only in prototypes if specified, usually to look for functions
  for (const [_, exported] of iterateModuleExports(m, byPrototype)) {
    if (
      props.every((p) =>
        byPrototype
          ? exported.prototype && p in (exported.prototype as Record<P, unknown>)
          : p in (exported as Record<P, unknown>),
      )
    ) {
      return exported as T;
    }
  }
}

// This doesn't have anywhere else to go

/**
 * Retrieves the key of first export from a module that contains all the specified properties.
 * @template T The expected type of the export that matches the specified properties.
 * @template P The type of the property keys to look for.
 * @param m The module to search through.
 * @param props An array of property keys to look for in the exports.
 * @param byPrototype Whether to search only in the prototype of the exports. Defaults to `false`.
 * @returns The key of first export that contains all the specified properties, or `undefined` if none is found.
 */
export function getExportsKeyForProps<T, P extends PropertyKey = keyof T>(
  m: unknown,
  props: P[],
  byPrototype?: boolean,
): string | undefined {
  // Loop over the module and its exports at the top level
  // Return the first thing that has all the indicated props
  // Checks only in prototypes if specified, usually to look for functions
  for (const [key, exported] of iterateModuleExports(m, byPrototype)) {
    if (
      key &&
      props.every((p) =>
        byPrototype
          ? exported.prototype && p in (exported.prototype as Record<P, unknown>)
          : p in (exported as Record<P, unknown>),
      )
    ) {
      return key;
    }
  }
}

export function getById<T>(id: number | string, raw?: false): T | undefined;
export function getById<T>(id: number | string, raw: true): RawModule<T> | undefined;
export function getById<T>(id: number | string, raw?: boolean): T | RawModule<T> | undefined;

/**
 * Retrieves a module by its ID.
 * The module will be loaded if it is not already present in the cache.
 *
 * Module IDs are not stable between Discord updates. This function is mainly useful for debugging.
 * You should not use this function in production unless the ID is dynamically determined.
 * @template T The expected type of the module's exports.
 * @param id The ID of the module to retrieve.
 * @param raw Whether to return the raw module object instead of its exports. Defaults to `false`.
 * @returns The module's exports, the raw module object, or `undefined` if the module could not be found.
 * @throws {Error} Will throw an error if Webpack is not initialized.
 */
export function getById<T>(id: number | string, raw = false): T | RawModule<T> | undefined {
  if (!wpRequire) throw new Error("Webpack not initialized");
  // Load the module if not already initialized
  if (!webpackChunks || !(id in webpackChunks)) {
    wpRequire(id);
  }

  // Get the module from the cache
  const rawModule = webpackChunks?.[id];

  if (raw) {
    return rawModule as RawModule<T> | undefined;
  }

  // Return the exports of the module
  // The value from wpRequire will not be sufficient, since that is often used
  // with the minified export name like so: wpRequire(69420).Z
  return typeof rawModule !== "undefined" ? getExports<T>(rawModule) : undefined;
}

// Searcher

// I'd prefer to use conditional types instead of overloading here, but I had some weird issues with it
// See https://github.com/microsoft/TypeScript/issues/33014
export function getModule<T>(filter: Filter, options?: { all?: false; raw?: false }): T | undefined;
export function getModule<T>(filter: Filter, options?: { all: true; raw?: false }): T[];
export function getModule<T>(
  filter: Filter,
  options?: { all?: false; raw: true },
): RawModule<T> | undefined;
export function getModule<T>(
  filter: Filter,
  options?: { all: true; raw: true },
): Array<RawModule<T>>;
export function getModule<T>(
  filter: Filter,
  options?: { all?: false; raw?: boolean },
): T | RawModule<T> | undefined;
export function getModule<T>(
  filter: Filter,
  options?: { all: true; raw?: boolean },
): T[] | Array<RawModule<T>>;
export function getModule<T>(
  filter: Filter,
  options?: { all?: boolean; raw?: false },
): T | T[] | undefined;
export function getModule<T>(
  filter: Filter,
  options?: { all?: boolean; raw: true },
): RawModule<T> | Array<RawModule<T>> | undefined;
export function getModule<T>(
  filter: Filter,
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;

/**
 * Retrieves a module(s) that matches the specified filter criteria.
 * @template T The expected type of the module(s) to be returned.
 * @param filter A function used to filter the modules.
 * @param options Configuration options for the module retrieval.
 * @param options.all Whether to retrieve all matching modules as an array. If `false`, retrieves only the first matching module. Defaults to `false`.
 * @param options.raw Whether to return the raw module(s) without processing their exports. Defaults to `false`.
 * @see {@link filters}
 * @returns The retrieved module(s) based on the filter and options.
 */
export function getModule<T>(
  filter: Filter,
  options: GetModuleOptions = {
    all: false,
    raw: false,
  },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  try {
    // Find nothing if webpack hasn't been started yet
    if (typeof webpackChunks === "undefined") return options.all ? [] : undefined;

    const wrappedFilter: Filter = (mod) => {
      try {
        return filter(mod);
      } catch (err) {
        logError({ text: "Error in getModule filter", err, filter, mod });
        return false;
      }
    };

    const modules = options.all
      ? Object.values(webpackChunks).filter(wrappedFilter)
      : Object.values(webpackChunks).find(wrappedFilter);

    if (options.raw) {
      return modules as RawModule<T> | Array<RawModule<T>> | undefined;
    }

    if (Array.isArray(modules)) {
      return modules.map((m) => getExports<T>(m)).filter((m): m is T => typeof m !== "undefined");
    } else if (modules) {
      return getExports<T>(modules);
    }
  } catch (err) {
    logError({ text: "Error getting module", err, filter });
    return options.all ? [] : undefined;
  }
}
