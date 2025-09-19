import type { Filter, LazyCallback, LazyListener, RawModule, WaitForOptions } from "src/types";
import { getExports, getModule } from "./get-modules";

/**
 * Listeners that will be checked when each module is initialized.
 * @internal
 */
export const listeners = new Set<LazyListener>();

function onModule<T>(filter: Filter, callback: LazyCallback<T>, raw?: false): () => void;
function onModule<T>(filter: Filter, callback: LazyCallback<RawModule<T>>, raw?: true): () => void;
function onModule<T>(
  filter: Filter,
  callback: LazyCallback<T> | LazyCallback<RawModule<T>>,
  raw?: boolean,
): () => void;

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
 * Waits for a module to be available that matches the specified filter.
 *
 * This function checks if the module already exists and returns it if found.
 * Otherwise, it waits for the module to be loaded and resolves with the module once it becomes available.
 * @template T The type of the module to wait for.
 * @param filter A filter function to identify the desired module.
 * @param options Options for waiting.
 * @param options.raw Whether to return the raw module instead of its exports.
 * @param options.timeout The maximum time to wait for the module (in milliseconds).
 * @see {@link filters}
 * @returns A promise that resolves with the module or rejects if the timeout is reached.
 * @throws {Error} Will throw an error if the timeout is reached before the module is available.
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
