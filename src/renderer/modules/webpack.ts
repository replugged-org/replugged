import { AnyFunction } from "src/types/util";
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
} from "../../types/discord";
import {
  Filter,
  GetModuleOptions,
  LazyCallback,
  LazyListener,
  PlaintextPatch,
  RawLazyCallback,
  RawPlaintextPatch,
  WaitForOptions,
} from "../../types/webpack";

// Handlers

/**
 * @internal
 * @hidden
 */
export let wpRequire: WebpackRequire;

let signalReady: () => void;

/**
 * @internal
 * @hidden
 */
export let ready = false;

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

/**
 * @internal
 * @hidden
 */
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

function getExports(m: RawModule): ModuleExports | undefined {
  if (typeof m.exports === "object") {
    const exportKeys = Object.keys(m.exports);
    if (exportKeys.length === 1 && ["default", "Z"].includes(exportKeys[0])) {
      return Object.values(m.exports)[0] as ModuleExports;
    }
  }
  return m.exports;
}

/**
 * Find an object in a module that has all the given properties. You will usually not need this function.
 * @param m Module to search
 * @param props Array of prop names
 * @returns Object that contains all the given properties (and any others), or undefined if not found
 */
export function getExportsForProps<P extends string>(
  m: ModuleExports,
  props: P[],
): ModuleExportsWithProps<P> | undefined {
  if (typeof m !== "object") return;

  return [m, ...Object.values(m)].find(
    (o) =>
      (typeof o === "object" || typeof o === "function") &&
      o !== null &&
      props.every((p) => p in o),
  ) as ModuleExportsWithProps<P> | undefined;
}

export function getById(id: number, raw?: false): ModuleExports | undefined;
export function getById(id: number, raw?: true): RawModule | undefined;

/**
 * Get a function by its ID
 *
 * @param id Module ID
 * @param raw Return the raw module instead of the exports
 *
 * @remarks
 * IDs are not stable between Discord updates. This function is mainly useful for debugging. You should not use this function in production unless the ID is dynamically determined.
 */
export function getById(id: number, raw = false): RawModule | ModuleExports | undefined {
  if (!(id in wpRequire.c)) {
    wpRequire(id);
  }

  const rawModule: RawModule | undefined = wpRequire.c[id];

  if (raw) {
    return rawModule;
  }

  return typeof rawModule !== "undefined" ? getExports(rawModule) : void 0;
}

// Searcher

// I'd prefer to use conditional types instead of overloading here, but I had some weird issues with it
// See https://github.com/microsoft/TypeScript/issues/33014
export function getModule(
  filter: Filter,
  options?: { all?: false; raw?: false },
): ModuleExports | undefined;
export function getModule(filter: Filter, options?: { all?: true; raw?: false }): ModuleExports[];
export function getModule(
  filter: Filter,
  options?: { all?: false; raw?: true },
): RawModule | undefined;
export function getModule(filter: Filter, options?: { all?: true; raw?: true }): RawModule[];

/**
 * Find a module that matches the given filter
 * @param filter Filter function
 * @param options Options
 * @param options.all Return all matching modules instead of just the first
 * @param options.raw Return the raw module instead of the exports
 *
 * @see {@link filters}
 */
export function getModule(
  filter: Filter,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): ModuleExports[] | RawModule[] | ModuleExports | RawModule | undefined {
  if (typeof wpRequire?.c === "undefined") return options.all ? [] : void 0;

  const modules = options.all
    ? Object.values(wpRequire.c).filter(filter)
    : Object.values(wpRequire.c).find(filter);

  if (options.raw) {
    return modules;
  }

  if (Array.isArray(modules)) {
    return modules.map(getExports).filter((m): m is ModuleExports => typeof m !== "undefined");
  } else if (modules) {
    return getExports(modules);
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
  export const byProps = <P extends string>(...props: P[]) => {
    return (m: RawModule): m is RawModuleWithProps<P> =>
      typeof getExportsForProps(m.exports, props) !== "undefined";
  };

  /**
   * Get a module whose source code matches the given string or RegExp
   * @param match String or RegExp to match in the module's source code
   *
   * @remarks
   * This function matches on the minified code, so make sure to keep that in mind when writing your strings/RegExp.
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

function onModule(filter: Filter, callback: LazyCallback, raw?: false): void;
function onModule(filter: Filter, callback: RawLazyCallback, raw?: true): () => void;

function onModule(
  filter: Filter,
  callback: LazyCallback | RawLazyCallback,
  raw = false,
): () => void {
  const wrappedCallback = raw
    ? (callback as RawLazyCallback)
    : (m: RawModule) => {
        const exports = getExports(m);
        if (typeof exports !== "undefined") {
          return (callback as LazyCallback)(exports);
        }
      };

  const rawModule = getModule(filter, { raw: true });
  if (rawModule) {
    wrappedCallback(rawModule);
  }

  const listener: LazyListener = [filter, wrappedCallback];
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function waitForModule(
  filter: Filter,
  options?: WaitForOptions & { raw?: false },
): Promise<ModuleExports>;
export async function waitForModule(
  filter: Filter,
  options?: WaitForOptions & { raw?: true },
): Promise<RawModule>;

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
export async function waitForModule(
  filter: Filter,
  options: WaitForOptions = {},
): Promise<RawModule | ModuleExports> {
  const existing = getModule(
    filter,
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/26242
    { all: false, raw: options.raw },
  );
  if (existing) {
    return Promise.resolve(existing);
  }

  const promise: Promise<RawModule | ModuleExports> = new Promise((resolve) => {
    // @ts-expect-error Same as before, I'm begging for partial type inference, Microsoft :((
    const unregister = onModule(
      filter,
      (mod) => {
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

export function getBySource(
  match: string | RegExp,
  options?: { all?: false; raw?: false },
): ModuleExports | undefined;
export function getBySource(
  match: string | RegExp,
  options?: { all?: true; raw?: false },
): ModuleExports[];
export function getBySource(
  match: string | RegExp,
  options?: { all?: false; raw?: true },
): RawModule | undefined;
export function getBySource(
  match: string | RegExp,
  options?: { all?: true; raw?: true },
): RawModule[];

/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 *
 * @see {@link filters}
 * @see {@link getModule}
 */
export function getBySource(
  match: string | RegExp,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): ModuleExports[] | RawModule[] | ModuleExports | RawModule | undefined {
  return getModule(
    filters.bySource(match),
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/26242
    options,
  );
}

export function getByProps<P extends string>(
  props: P[],
  options: { all?: false; raw?: false },
): ModuleExportsWithProps<P> | undefined;
export function getByProps<P extends string>(
  props: P[],
  options: { all?: true; raw?: false },
): Array<ModuleExportsWithProps<P>>;
export function getByProps<P extends string>(
  props: P[],
  options: { all?: false; raw?: true },
): RawModule | undefined;
export function getByProps<P extends string>(
  props: P[],
  options: { all?: true; raw?: true },
): RawModule[];
export function getByProps<P extends string>(...props: P[]): ModuleExportsWithProps<P> | undefined;

/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters}
 * @see {@link getModule}
 */
export function getByProps<P extends string>(
  ...args: [P[], GetModuleOptions] | P[]
):
  | Array<ModuleExportsWithProps<P>>
  | RawModule[]
  | ModuleExportsWithProps<P>
  | RawModule
  | undefined {
  const props = (typeof args[0] === "string" ? args : args[0]) as string[];
  const raw = typeof args[0] === "string" ? false : (args[1] as GetModuleOptions)?.raw;

  const result = (
    typeof args[args.length - 1] === "object"
      ? getModule(
          filters.byProps(...props),
          // @ts-expect-error https://github.com/microsoft/TypeScript/issues/26242
          args[args.length - 1] as GetModuleOptions,
        )
      : getModule(filters.byProps(...props))
  ) as
    | Array<ModuleExportsWithProps<P>>
    | ModuleExportsWithProps<P>
    | RawModule
    | RawModule[]
    | undefined;

  if (raw || typeof result === "undefined") {
    return result;
  }

  if (result instanceof Array) {
    // @ts-expect-error TypeScript isn't going to infer types based on the raw variable, so this is fine
    return result.map(getExportsForProps, props);
  }

  return getExportsForProps(result as ModuleExportsWithProps<P>, props);
}

// Specalized, inner-module searchers

/**
 * Search for a function within a module by its source code.
 *
 * @param match The string or regex to match against the function's source code.
 * @param module The module to search.
 */
export function getFunctionBySource(
  match: string | RegExp,
  module: ObjectExports,
): AnyFunction | undefined {
  return Object.values(module).find((v) => {
    if (typeof v !== "function") {
      return false;
    }

    return typeof match === "string" ? v.toString().includes(match) : match.test(v.toString());
  }) as AnyFunction | undefined;
}
