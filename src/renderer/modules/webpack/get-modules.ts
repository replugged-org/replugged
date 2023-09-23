import type { Filter, GetModuleOptions, RawModule } from "src/types";
import { wpRequire } from "./patch-load";
import { logError } from "./util";
import assert from "assert";

// Export-finding utilities

/**
 * Get the default export (or top-level exports) for a module
 * @param m Raw module
 * @returns Exports
 * @internal
 */
export function getExports<T>(m: RawModule): T | undefined {
  if (typeof m.exports === "object" && m.exports) {
    if (Object.keys(m.exports).length === 1) {
      for (const key of ["Z", "ZP", "default"] as const) {
        if (key in m.exports) return (m.exports as Record<typeof key, T>)[key];
      }
    }
  }
  return m.exports as T | undefined;
}

/**
 * Iterates over an object and its top-level children that could have properties
 * @param m Object (module exports) to iterate over
 */
function* iterateModuleExports(m: unknown): IterableIterator<Record<PropertyKey, unknown>> {
  // if m is null or not an object/function, then it will obviously not have the props
  // if if has no props, then it definitely has no children either
  if (m && (typeof m === "object" || typeof m === "function")) {
    yield m as Record<PropertyKey, unknown>;
    for (const key in m) {
      try {
        // This could throw an error ("illegal invocation") if val === DOMTokenList.prototype
        // and key === "length"
        // There could be other cases too, hence this try-catch instead of a specific exclusion
        const val = (m as Record<PropertyKey, unknown>)[key];
        if (val && (typeof val === "object" || typeof val === "function")) {
          yield val as Record<PropertyKey, unknown>;
        }
      } catch {
        // ignore this export
      }
    }
  }
}

/**
 * Find an object in a module that has all the given properties. You will usually not need this function.
 * @param m Module to search
 * @param props Array of prop names
 * @returns Object that contains all the given properties (and any others), or undefined if not found
 */
export function getExportsForProps<T, P extends PropertyKey = keyof T>(
  m: unknown,
  props: P[],
): T | undefined {
  // Loop over the module and its exports at the top level
  // Return the first thing that has all the indicated props
  for (const exported of iterateModuleExports(m)) {
    if (props.every((p) => p in (exported as Record<P, unknown>))) {
      return exported as T;
    }
  }
}

// This doesn't have anywhere else to go

export function getById<T>(id: number, raw?: false): T | undefined;
export function getById<T>(id: number, raw: true): RawModule<T> | undefined;
export function getById<T>(id: number, raw?: boolean): T | RawModule<T> | undefined;
/**
 * Get a function by its ID
 *
 * @param id Module ID
 * @param raw Return the raw module instead of the exports
 *
 * @remarks
 * IDs are not stable between Discord updates. This function is mainly useful for debugging.
 * You should not use this function in production unless the ID is dynamically determined.
 */
export function getById<T>(id: number, raw = false): T | RawModule<T> | undefined {
  assert(wpRequire, "Webpack not initialized");
  // Load the module if not already initialized
  if (!(id in wpRequire.c)) {
    wpRequire(id);
  }

  // Get the module from the cache
  const rawModule: RawModule | undefined = wpRequire.c[id];

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
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
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
    if (typeof wpRequire?.c === "undefined") return options.all ? [] : undefined;

    const wrappedFilter: Filter = (mod) => {
      try {
        return filter(mod);
      } catch (err) {
        logError({ text: "Error in getModule filter", err, filter, mod });
        return false;
      }
    };

    const modules = options.all
      ? Object.values(wpRequire.c).filter(wrappedFilter)
      : Object.values(wpRequire.c).find(wrappedFilter);

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
