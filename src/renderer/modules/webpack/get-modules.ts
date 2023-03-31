import type {
  Filter,
  GetModuleOptions,
  ModuleExports,
  ModuleExportsWithProps,
  RawModule,
} from "src/types";
import { wpRequire } from "./patch-load";
import { logError } from "./util";
import { byValue } from "./filters";

// Helpers

export function getExports<T extends ModuleExports = ModuleExports>(m: RawModule): T | undefined {
  if (typeof m.exports === "object") {
    const exportKeys = Object.keys(m.exports);
    if (exportKeys.length === 1 && ["default", "Z"].includes(exportKeys[0])) {
      return Object.values(m.exports)[0] as T;
    }
  }
  return m.exports as T | undefined;
}

/**
 * Find an object in a module that has all the given properties. You will usually not need this function.
 * @param m Module to search
 * @param props Array of prop names
 * @returns Object that contains all the given properties (and any others), or undefined if not found
 */
export function getExportsForProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(m: ModuleExports, props: P[]): T | undefined {
  try {
    if (typeof m !== "object") return;

    return [m, ...Object.values(m)].find((o) => {
      if (typeof o !== "object" && typeof o !== "function") return false;
      if (o === null) return false;

      return props.every((p) => {
        try {
          return p in o;
        } catch (err) {
          logError({
            text: "Error accessing property in getExportsForProps",
            err,
            module: m,
            props,
            object: o,
            prop: p,
          });
          return false;
        }
      });
    }) as T | undefined;
  } catch (err) {
    logError({ text: "Error in getExportsForProps", err, module: m, props });
  }
}

export function getById<T extends ModuleExports = ModuleExports>(
  id: number,
  raw?: false,
): T | undefined;
export function getById<T extends RawModule = RawModule>(id: number, raw?: true): T | undefined;
export function getById<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  id: number,
  raw?: boolean,
): T | undefined;
/**
 * Get a function by its ID
 *
 * @param id Module ID
 * @param raw Return the raw module instead of the exports
 *
 * @remarks
 * IDs are not stable between Discord updates. This function is mainly useful for debugging. You should not use this function in production unless the ID is dynamically determined.
 */
export function getById<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  id: number,
  raw = false,
): T | undefined {
  if (!(id in wpRequire.c)) {
    wpRequire(id);
  }

  const rawModule: RawModule | undefined = wpRequire.c[id];

  if (raw) {
    return rawModule as T & RawModule;
  }

  return typeof rawModule !== "undefined" ? getExports<T & ModuleExports>(rawModule) : void 0;
}

// Searcher

// I'd prefer to use conditional types instead of overloading here, but I had some weird issues with it
// See https://github.com/microsoft/TypeScript/issues/33014
export function getModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: { all?: false; raw?: false },
): T | undefined;
export function getModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: { all?: true; raw?: false },
): T[];
export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: { all?: false; raw?: true },
): T | undefined;
export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: { all?: true; raw?: true },
): T[];
export function getModule<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  filter: Filter,
  options?: { all?: boolean; raw?: boolean },
): T[] | T | undefined;
/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 */
export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): T[] | T | undefined {
  try {
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
      return modules as T & RawModule;
    }

    if (Array.isArray(modules)) {
      return modules
        .map((m) => getExports<T & ModuleExports>(m))
        .filter((m): m is T & ModuleExports => typeof m !== "undefined");
    } else if (modules) {
      return getExports<T & ModuleExports>(modules);
    }
  } catch (err) {
    logError({ text: "Error getting module", err, filter });
    return options.all ? [] : undefined;
  }
}

/**
 * Equivalent to `getModule(filters.byValue(match), options)`
 * @param match The string to check the value against
 *
 * @see {@link filters.byValue}
 */
export function getByValue(
  match: string | RegExp,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): RawModule | ModuleExports | Array<RawModule | ModuleExports> | undefined {
  return getModule(byValue(match), options);
}
