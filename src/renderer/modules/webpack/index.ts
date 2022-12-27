/* eslint-disable @typescript-eslint/unified-signatures */
import { AnyFunction } from "../../../types/util";
import {
  ModuleExports,
  ModuleExportsWithProps,
  ObjectExports,
  RawModule,
  RawModuleWithProps,
  WebpackChunk,
  WebpackChunkGlobal,
  WebpackModule,
  WebpackRequire,
} from "../../../types/discord";
import {
  Filter,
  GetModuleOptions,
  LazyCallback,
  LazyListener,
  PlaintextPatch,
  RawLazyCallback,
  RawPlaintextPatch,
  WaitForOptions,
} from "../../../types/webpack";

// Handlers

let wpRequire: WebpackRequire;

let signalReady: () => void;
let ready = false;

/**
 * @internal
 * @hidden
 */
export const waitForReady = new Promise<void>(
  (resolve) =>
    (signalReady = () => {
      ready = true;
      resolve();
    }),
);

/**
 * @internal
 * @hidden
 */
export let signalStart: () => void;

/**
 * @internal
 * @hidden
 */
export const waitForStart = new Promise<void>((resolve) => (signalStart = resolve));

export const sourceStrings: Record<number, string> = {};

const listeners = new Set<LazyListener>();
const plaintextPatches: RawPlaintextPatch[] = [];

function patchModuleSource(mod: WebpackModule): WebpackModule {
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

function patchPush(webpackChunk: WebpackChunkGlobal): void {
  let original = webpackChunk.push;

  async function handlePush(chunk: WebpackChunk): Promise<unknown> {
    await waitForStart;

    const modules = chunk[1];
    for (const id in modules) {
      const originalMod = modules[id];
      sourceStrings[id] = originalMod.toString();
      const mod = patchModuleSource(originalMod);
      modules[id] = function (module, exports, require) {
        mod(module, exports, require);

        for (const [filter, callback] of listeners) {
          if (filter(module)) {
            callback(module);
          }
        }
      };
    }

    return original.call(webpackChunk, chunk);
  }

  Object.defineProperty(webpackChunk, "push", {
    get: () => handlePush,
    set: (v) => (original = v),
    configurable: true,
  });
}

function loadWebpackModules(webpackChunk: WebpackChunkGlobal): void {
  wpRequire = webpackChunk.push([
    [Symbol("replugged")],
    {},
    (r: WebpackRequire) => r,
  ]) as WebpackRequire;

  wpRequire.d = (module: ModuleExports, exports: Record<string, () => unknown>) => {
    for (const prop in exports) {
      if (Object.hasOwnProperty.call(exports, prop) && !Object.hasOwnProperty.call(module, prop)) {
        Object.defineProperty(module, prop, {
          enumerable: true,
          configurable: true,
          get: () => exports[prop](),
          set: (value) => (exports[prop] = () => value),
        });
      }
    }
  };

  patchPush(webpackChunk);
  signalReady();
}

// Because using a timer is bad, thanks Ven
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: WebpackChunkGlobal | undefined;

Object.defineProperty(window, "webpackChunkdiscord_app", {
  get: () => webpackChunk,
  set: (v) => {
    if (!ready && v?.push !== Array.prototype.push) {
      loadWebpackModules(v);
    }
    webpackChunk = v;
  },
  configurable: true,
});

// Helpers

function getExports<T extends ModuleExports = ModuleExports>(m: RawModule): T | undefined {
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
  if (typeof m !== "object") return;

  return [m, ...Object.values(m)].find(
    (o) =>
      (typeof o === "object" || typeof o === "function") &&
      o !== null &&
      props.every((p) => p in o),
  ) as T | undefined;
}

/**
 * Get a function by its ID
 *
 * @param id Module ID
 * @param raw Return the raw module instead of the exports
 *
 * @remarks
 * IDs are not stable between Discord updates. This function is mainly useful for debugging. You should not use this function in production unless the ID is dynamically determined.
 *
 * @hidden
 */
export function getById<T extends ModuleExports = ModuleExports>(
  id: number,
  raw?: false,
): T | undefined;
/**
 * Get a function by its ID
 *
 * @param id Module ID
 * @param raw Return the raw module instead of the exports
 *
 * @remarks
 * IDs are not stable between Discord updates. This function is mainly useful for debugging. You should not use this function in production unless the ID is dynamically determined.
 *
 * @hidden
 */
export function getById<T extends RawModule = RawModule>(id: number, raw?: true): T | undefined;

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
  raw?: boolean,
): T | undefined;

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
/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 *
 * @hidden
 */ export function getModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: { all?: false; raw?: false },
): T | undefined;
/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 *
 * @hidden
 */ export function getModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: { all?: true; raw?: false },
): T[];
/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 *
 * @hidden
 */ export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: { all?: false; raw?: true },
): T | undefined;

/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 *
 * @hidden
 */
export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: { all?: true; raw?: true },
): T[];

/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 */
export function getModule<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  filter: Filter,
  options?: { all?: boolean; raw?: boolean },
): T[] | T | undefined;

export function getModule<T extends RawModule = RawModule>(
  filter: Filter,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): T[] | T | undefined {
  if (typeof wpRequire?.c === "undefined") return options.all ? [] : void 0;

  const modules = options.all
    ? Object.values(wpRequire.c).filter(filter)
    : Object.values(wpRequire.c).find(filter);

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
}

// Filters

/**
 * Filter functions to use with {@link getModule}
 */
export namespace filters {
  /**
   * Get a module that has all the given properties on one of its exports
   * @param props List of property names
   */
  export const byProps = <P extends string = string>(...props: P[]) => {
    return (m: RawModule): m is RawModuleWithProps<P> =>
      typeof getExportsForProps(m.exports, props) !== "undefined";
  };

  /**
   * Get a module whose source code matches the given string or RegExp
   * @param match String or RegExp to match in the module's source code
   *
   * @remarks
   * This function matches on the minified code, so make sure to keep that in mind when writing your strings/RegExp.
   * Randomized variable names (usually 1-2 letters) are not stable between Discord updates. Make sure to use wildcards to make sure your RegExp matches if the variable name were to.
   */
  export const bySource = (match: string | RegExp) => {
    return (m: RawModule) => {
      const source = sourceStrings[m.id];
      if (!source) return false;

      return typeof match === "string" ? source.includes(match) : match.test(source);
    };
  };
}

// Async

/** @hidden */
function onModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  callback: LazyCallback<T>,
  raw?: false,
): () => void;
/** @hidden */
function onModule<T extends RawModule = RawModule>(
  filter: Filter,
  callback: RawLazyCallback<T>,
  raw?: true,
): () => void;

function onModule<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  filter: Filter,
  callback: LazyCallback<T & ModuleExports> | RawLazyCallback<T & RawModule>,
  raw?: boolean,
): () => void;

function onModule<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  filter: Filter,
  callback: LazyCallback<T & ModuleExports> | RawLazyCallback<T & RawModule>,
  raw = false,
): () => void {
  const wrappedCallback = raw
    ? (callback as RawLazyCallback<T & RawModule>)
    : (m: T & RawModule) => {
        const exports = getExports<T & ModuleExports>(m);
        if (typeof exports !== "undefined") {
          return (callback as LazyCallback<T & ModuleExports>)(exports);
        }
      };

  const rawModule = getModule<T & RawModule>(filter, { raw: true });
  if (rawModule) {
    wrappedCallback(rawModule);
  }

  const listener: LazyListener = [filter, wrappedCallback as RawLazyCallback];
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Wait for a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.raw Return the raw module instead of the exports
 * @param options.timeout Timeout in milliseconds
 *
 * @see {@link filters}
 *
 * @remarks
 * Some modules may not be available immediately when Discord starts and will take up to a few seconds. This is useful to ensure that the module is available before using it.
 *
 * @hidden
 */
export async function waitForModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: WaitForOptions & { raw?: false },
): Promise<T>;

/**
 * Wait for a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.raw Return the raw module instead of the exports
 * @param options.timeout Timeout in milliseconds
 *
 * @see {@link filters}
 *
 * @remarks
 * Some modules may not be available immediately when Discord starts and will take up to a few seconds. This is useful to ensure that the module is available before using it.
 *
 * @hidden
 */
export async function waitForModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: WaitForOptions & { raw?: true },
): Promise<T>;

/**
 * Wait for a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.raw Return the raw module instead of the exports
 * @param options.timeout Timeout in milliseconds
 *
 * @see {@link filters}
 *
 * @remarks
 * Some modules may not be available immediately when Discord starts and will take up to a few seconds. This is useful to ensure that the module is available before using it.
 */
export async function waitForModule<
  T extends RawModule | ModuleExports = RawModule | ModuleExports,
>(filter: Filter, options: WaitForOptions): Promise<T>;

export async function waitForModule<
  T extends RawModule | ModuleExports = RawModule | ModuleExports,
>(filter: Filter, options: WaitForOptions = {}): Promise<T> {
  const existing = getModule(filter, { all: false, raw: options.raw }) as
    | (typeof options["raw"] extends true ? T & RawModule : T & ModuleExports)
    | undefined;
  if (existing) {
    return Promise.resolve(existing);
  }

  const promise: Promise<T> = new Promise((resolve) => {
    const unregister = onModule<T>(
      filter,
      (mod: T) => {
        unregister();
        resolve(mod);
      },
      options.raw,
    );
  });

  if (!options.timeout) return promise;

  let timeout: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`waitForModule timed out after ${options.timeout}ms`));
    }, options.timeout);
  });

  return await Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

// Plaintext

/**
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

// Helpers for the lazy

/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getBySource<T extends ModuleExports = ModuleExports>(
  match: string | RegExp,
  options?: { all?: false; raw?: false },
): T | undefined;

/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getBySource<T extends ModuleExports = ModuleExports>(
  match: string | RegExp,
  options?: { all?: true; raw?: false },
): T[];
/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getBySource<T extends RawModule = RawModule>(
  match: string | RegExp,
  options?: { all?: false; raw?: true },
): T | undefined;
/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getBySource<T extends RawModule = RawModule>(
  match: string | RegExp,
  options?: { all?: true; raw?: true },
): T[];

/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 */
export function getBySource<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  match: string | RegExp,
  options?: { all?: boolean; raw?: boolean },
): T[] | T | undefined;

export function getBySource<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  match: string | RegExp,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): T[] | T | undefined {
  return getModule(filters.bySource(match), options);
}

/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(props: P[], options: { all?: false; raw?: false }): T | undefined;
/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(props: P[], options: { all?: true; raw?: false }): T[];
/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getByProps<P extends string = string, T extends RawModule = RawModule>(
  props: P[],
  options: { all?: false; raw?: true },
): T | undefined;
/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 *
 * @hidden
 */
export function getByProps<P extends string = string, T extends RawModule = RawModule>(
  props: P[],
  options: { all?: true; raw?: true },
): T[];

/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 */
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(props: P[], options?: { all?: boolean; raw?: boolean }): T[] | T | undefined;

/**
 * Equivalent to `getModule(filters.byProps(...props), {all: false, raw: false})`
 *
 * @see {@link filters}
 * @see {@link getModule}
 */
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(...props: P[]): T | undefined;

export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(...args: [P[], GetModuleOptions] | P[]): T[] | T | undefined {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as GetModuleOptions)?.raw;

  const result = (
    typeof args[args.length - 1] === "object"
      ? getModule(filters.byProps(...props), args[args.length - 1] as GetModuleOptions)
      : getModule(filters.byProps(...props))
  ) as
    | Array<ModuleExportsWithProps<P>>
    | ModuleExportsWithProps<P>
    | RawModule
    | RawModule[]
    | undefined;

  if (raw || typeof result === "undefined") {
    return result as (T & RawModule) | undefined;
  }

  if (result instanceof Array) {
    // @ts-expect-error TypeScript isn't going to infer types based on the raw variable, so this is fine
    return result.map((m) => getExportsForProps(m, props));
  }

  return getExportsForProps<P, T & ModuleExportsWithProps<P>>(result as T & ModuleExports, props);
}

// Specialized, inner-module searchers

/**
 * Search for a function within a module by its source code.
 *
 * @param match The string or regex to match against the function's source code.
 * @param module The module to search.
 */
export function getFunctionBySource<T extends AnyFunction = AnyFunction>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  match: string | RegExp | ((func: Function) => boolean),
  module: ObjectExports,
): T | undefined {
  return Object.values(module).find((v) => {
    if (typeof v !== "function") return false;

    if (typeof match === "function") {
      return match(v);
    } else {
      return typeof match === "string" ? v.toString().includes(match) : match.test(v.toString());
    }
  }) as T | undefined;
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
  match: string | RegExp,
  module: T,
): P | undefined {
  return Object.entries(module).find(([_, v]) => {
    if (typeof v !== "function") {
      return false;
    }

    return typeof match === "string" ? v.toString().includes(match) : match.test(v.toString());
  })?.[0] as P | undefined;
}
