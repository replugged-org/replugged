import type { Filter, LazyCallback, LazyListener, RawModule, WaitForOptions } from "src/types";

import { getExports, getModule } from "./get-modules";

import type { Store } from "@common/flux";

/**
 * Listeners that will be checked when each module is initialized
 */
export const listeners = new Set<LazyListener>();

/** @hidden */
function onModule<T>(filter: Filter, callback: LazyCallback<T>, raw?: false): () => void;
/** @hidden */
function onModule<T>(filter: Filter, callback: LazyCallback<RawModule<T>>, raw?: true): () => void;
function onModule<T>(
  filter: Filter,
  callback: LazyCallback<T> | LazyCallback<RawModule<T>>,
  raw?: boolean,
): () => void;
/**
 * Handle a module being loaded and perform an action if needed.
 * @param filter Filter to check the module against
 * @param callback Action to take if the filter returns true
 * @param raw Whether to pass the raw module to the callback
 * @returns Function to unregister the listener this creates
 */
function onModule<T>(
  filter: Filter,
  callback: LazyCallback<T> | LazyCallback<RawModule<T>>,
  raw = false,
): () => void {
  // Wrap the callback to get exports if not looking for raw modules
  const wrappedCallback = raw
    ? (callback as LazyCallback<RawModule<T>>)
    : (m: RawModule<T>) => {
        const exports = getExports<T>(m);
        if (typeof exports !== "undefined") {
          (callback as LazyCallback<T>)(exports);
        }
      };

  // First look to see whether the module is already in the cache
  const rawModule = getModule<T>(filter, { raw: true });
  if (rawModule) {
    wrappedCallback(rawModule);
  }

  // If not in the cache, then listen for it
  const listener: LazyListener = [filter, wrappedCallback as LazyCallback<RawModule>];
  listeners.add(listener);

  // Function to unregister listener
  return () => void listeners.delete(listener);
}

export async function waitForModule<T>(
  filter: Filter,
  options?: WaitForOptions & { raw?: false },
): Promise<T>;
export async function waitForModule<T>(
  filter: Filter,
  options?: WaitForOptions & { raw: true },
): Promise<RawModule<T>>;
export async function waitForModule<T>(
  filter: Filter,
  options?: WaitForOptions,
): Promise<T | RawModule<T>>;
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
 * Some modules may not be available immediately when Discord starts and will take up to a few seconds.
 * This is useful to ensure that the module is available before using it.
 */
export async function waitForModule<T>(
  filter: Filter,
  options: WaitForOptions = {},
): Promise<T | RawModule<T>> {
  const existing = getModule<T>(filter, { all: false, raw: options.raw });
  if (existing) {
    return existing;
  }

  // Promise that resolves with the module
  const promise = new Promise<T>((resolve) => {
    const unregister = onModule<T>(
      filter,
      (mod: T) => {
        unregister();
        resolve(mod);
      },
      options.raw,
    );
  });

  // If no timeout, then wait for as long as it takes
  if (!options.timeout) return promise;

  // Different in Node and browser environments--number in browser, NodeJS.Timeout in Node
  let timeout: ReturnType<typeof setTimeout>;

  // Promise that rejects if the module takes too long to appear
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`waitForModule timed out after ${options.timeout}ms`));
    }, options.timeout);
  });

  // Go with whichever happens first
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

export async function waitForStore<T extends Store>(
  filter: string,
  options?: { timeout?: number },
): Promise<T>;

/**
 * Wait for a module that matches the given filter
 * @param filter Store Name
 * @param options Options
 * @param options.timeout Timeout in milliseconds
 *
 * @see {@link filters}
 *
 * @remarks
 * Some modules may not be available immediately when Discord starts and will take up to a few seconds.
 * This is useful to ensure that the module is available before using it.
 */
export async function waitForStore<T extends Store>(
  name: string,
  options: { timeout?: number } = {},
): Promise<T> {
  const { flux } = await import("@common");
  const existingStores = flux.Store.getAll() as Store[] & {
    listeners?: Set<Array<string | ((store: Store) => void)>>;
    onPush?: (name: string, callback: (store: Store) => void) => () => void;
  };
  if (!existingStores.listeners) {
    existingStores.listeners = new Set<[string, (store: Store) => void]>();
    existingStores.onPush = (name, callback) => {
      const store = existingStores.find((store) => store.getName() === name);
      if (store) {
        callback(store);
      }
      const listener = [name, callback];
      existingStores.listeners!.add(listener);
      return () => existingStores.listeners!.delete(listener);
    };
    existingStores.push = (...stores: Store[]) => {
      for (const [name, callback] of existingStores.listeners!) {
        const store = stores.find((store) => store.getName() === name);
        if (store) {
          (callback as (store: Store) => void)(store);
        }
      }
      return Array.prototype.push.call(existingStores, ...stores);
    };
  }
  const existingStore = existingStores.find((store) => store.getName() === name) as T | undefined;

  if (existingStore) {
    return existingStore;
  }

  // Promise that resolves with the module
  const promise = new Promise<T>((resolve) => {
    const unregister = existingStores.onPush!(name, (store: Store) => {
      unregister();
      resolve(store as T);
    });
  });

  // If no timeout, then wait for as long as it takes
  if (!options.timeout) return promise;

  // Different in Node and browser environments--number in browser, NodeJS.Timeout in Node
  let timeout: ReturnType<typeof setTimeout>;

  // Promise that rejects if the module takes too long to appear
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`waitForStore timed out after ${options.timeout}ms`));
    }, options.timeout);
  });

  // Go with whichever happens first
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}
