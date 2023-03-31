import type {
  Filter,
  LazyCallback,
  LazyListener,
  ModuleExports,
  RawLazyCallback,
  RawModule,
  WaitForOptions,
} from "src/types";

import { getExports, getModule } from "./get-modules";

export const listeners = new Set<LazyListener>();

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

export async function waitForModule<T extends ModuleExports = ModuleExports>(
  filter: Filter,
  options?: WaitForOptions & { raw?: false },
): Promise<T>;
export async function waitForModule<T extends RawModule = RawModule>(
  filter: Filter,
  options?: WaitForOptions & { raw?: true },
): Promise<T>;
export async function waitForModule<
  T extends RawModule | ModuleExports = RawModule | ModuleExports,
>(filter: Filter, options: WaitForOptions): Promise<T>;
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
>(filter: Filter, options: WaitForOptions = {}): Promise<T> {
  const existing = getModule(filter, { all: false, raw: options.raw }) as
    | ((typeof options)["raw"] extends true ? T & RawModule : T & ModuleExports)
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

  // Different in Node and browser environments--number in browser, NodeJS.Timeout in Node
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`waitForModule timed out after ${options.timeout}ms`));
    }, options.timeout);
  });

  return await Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}
