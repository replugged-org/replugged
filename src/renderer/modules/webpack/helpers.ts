import type { GetModuleOptions, RawModule, WaitForOptions } from "src/types";
import { flux } from "../common";
import type { Store } from "../common/flux";
import * as filters from "./filters";
import { getExportsForProps, getModule } from "./get-modules";
import { waitForModule } from "./lazy";

// Get by source

export function getBySource<T>(
  match: string | RegExp,
  options?: { all?: false; raw?: false },
): T | undefined;
export function getBySource<T>(match: string | RegExp, options: { all: true; raw?: false }): T[];
export function getBySource<T>(
  match: string | RegExp,
  options: { all: false; raw: true },
): RawModule<T> | undefined;
export function getBySource<T>(
  match: string | RegExp,
  options: { all: true; raw: true },
): Array<RawModule<T>>;
export function getBySource<T>(
  match: string | RegExp,
  options: { all?: false; raw?: boolean },
): T | RawModule<T> | undefined;
export function getBySource<T>(
  match: string | RegExp,
  options: { all: true; raw?: boolean },
): T[] | Array<RawModule<T>>;
export function getBySource<T>(
  match: string | RegExp,
  options: { all: boolean; raw?: false },
): T | T[] | undefined;
export function getBySource<T>(
  match: string | RegExp,
  options: { all: boolean; raw: true },
): RawModule<T> | Array<RawModule<T>> | undefined;
export function getBySource<T>(
  match: string | RegExp,
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;

/**
 * Retrieves a module(s) by matching its source code against a string or regular expression.
 *
 * Equivalent to `getModule(filters.bySource(match), options)`.
 * @template T The expected type of the module(s) to be returned.
 * @param match A string or regular expression to match against the module's source code.
 * @param options Configuration options for the module retrieval.
 * @returns The matching module(s) or `undefined` if no match is found.
 * @see {@link filters.bySource}
 * @see {@link getModule}
 */
export function getBySource<T>(
  match: string | RegExp,
  options: GetModuleOptions = { all: false, raw: false },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  return getModule<T>(filters.bySource(match), options);
}

// Get by props

export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all?: false; raw?: false },
): T | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all: true; raw?: false },
): T[];
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: false; raw: true },
): RawModule<T> | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all: true; raw: true },
): Array<RawModule<T>>;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all: true; raw?: boolean },
): T[] | Array<RawModule<T>>;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: false; raw?: boolean },
): T | RawModule<T> | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: boolean; raw: true },
): RawModule<T> | Array<RawModule<T>> | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: boolean; raw?: false },
): T | T[] | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;
export function getByProps<T, P extends PropertyKey[] = Array<keyof T>>(...props: P): T | undefined;

/**
 * Retrieves a module(s) by their properties.
 *
 * Equivalent to `getModule(filters.byProps(...props), options)`.
 * @template T The type of the module(s) being retrieved.
 * @template P The type of the property keys being searched for.
 * @param args Either an array of property keys to search for,
 * or an array containing the property keys and an optional configuration object.
 * @returns The module(s) or processed exports that match the specified properties, or `undefined` if no match is found.
 * @see {@link filters.byProps}
 * @see {@link getModule}
 */
export function getByProps<T, P extends PropertyKey = keyof T>(
  ...args: [P[], GetModuleOptions] | P[]
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as GetModuleOptions | undefined)?.raw;

  const result =
    typeof args.at(-1) === "object"
      ? getModule<T>(filters.byProps(...props), args.at(-1) as GetModuleOptions)
      : getModule<T>(filters.byProps(...props));

  if (raw || typeof result === "undefined") {
    return result as RawModule<T> | undefined;
  }

  if (result instanceof Array) {
    // @ts-expect-error TypeScript isn't going to infer types based on the raw variable, so this is fine
    return result.map((m) => getExportsForProps(m, props));
  }

  return getExportsForProps<T, P>(result, props);
}

// Wait for props

export function waitForProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: WaitForOptions & { raw?: false },
): Promise<T>;
export function waitForProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: WaitForOptions & { raw: true },
): Promise<RawModule<T>>;
export function waitForProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: WaitForOptions,
): Promise<T | RawModule<T>>;
export function waitForProps<T, P extends PropertyKey = keyof T>(...props: P[]): Promise<T>;

/**
 * Waits for a module that contains the specified properties and returns it.
 *
 * Like {@link getByProps} but waits for the module to be loaded.
 * @template T The type of the module to be returned.
 * @template P The type of the property keys to look for in the module's exports.
 * @param args Either an array of property keys to look for in the module's exports,
 * or an array containing the property keys and an optional configuration object.
 * @returns A promise that resolves to the module containing the specified properties.
 * @see {@link getByProps}
 * @see {@link waitForModule}
 */
export async function waitForProps<T, P extends PropertyKey = keyof T>(
  ...args: [P[], WaitForOptions] | P[]
): Promise<T | RawModule<T>> {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as WaitForOptions | undefined)?.raw;

  const result = await (typeof args.at(-1) === "object"
    ? waitForModule<T>(filters.byProps(...props), args.at(-1) as WaitForOptions)
    : waitForModule<T>(filters.byProps(...props)));

  if (raw) {
    return result as RawModule<T>;
  }

  // We know this will always exist since filters.byProps will always return a module that has the props
  return getExportsForProps<T, P>(result as T, props)!;
}

// Get by prototype

export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all?: false; raw?: false },
): T | undefined;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all: true; raw?: false },
): T[];
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: false; raw: true },
): RawModule<T> | undefined;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all: true; raw: true },
): Array<RawModule<T>>;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all: true; raw?: boolean },
): T[] | Array<RawModule<T>>;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: false; raw?: boolean },
): T | RawModule<T> | undefined;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: boolean; raw: true },
): RawModule<T> | Array<RawModule<T>> | undefined;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: { all?: boolean; raw?: false },
): T | T[] | undefined;
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;
export function getByPrototype<T, P extends PropertyKey[] = Array<keyof T>>(
  ...props: P
): T | undefined;

/**
 * Retrieves a module(s) by matching properties on their prototype.
 *
 * Equivalent to `getModule(filters.byPrototype(...props), options)`.
 * @template T The type of the module(s) to retrieve.
 * @template P The type of the property keys to match on the prototype.
 * @param args Either an array of property keys to look for in the prototype,
 * or an array containing the property keys and an optional configuration object.
 * @returns The module(s) or processed exports that match the specified prototype properties, or `undefined` if no match is found.
 * @see {@link filters.byPrototype}
 * @see {@link getModule}
 */
export function getByPrototype<T, P extends PropertyKey = keyof T>(
  ...args: [P[], GetModuleOptions] | P[]
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as GetModuleOptions | undefined)?.raw;

  const result =
    typeof args.at(-1) === "object"
      ? getModule<T>(filters.byPrototype(...props), args.at(-1) as GetModuleOptions)
      : getModule<T>(filters.byPrototype(...props));

  if (raw || typeof result === "undefined") {
    return result as RawModule<T> | undefined;
  }

  if (result instanceof Array) {
    // @ts-expect-error TypeScript isn't going to infer types based on the raw variable, so this is fine
    return result.map((m) => getExportsForProps(m, props, true));
  }

  return getExportsForProps<T, P>(result, props, true);
}

// Wait for prototype

export function waitForPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: WaitForOptions & { raw?: false },
): Promise<T>;
export function waitForPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options: WaitForOptions & { raw: true },
): Promise<RawModule<T>>;
export function waitForPrototype<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: WaitForOptions,
): Promise<T | RawModule<T>>;
export function waitForPrototype<T, P extends PropertyKey = keyof T>(...props: P[]): Promise<T>;

/**
 * Waits for a module that contains the specified prototype properties and returns it.
 *
 * Like {@link getByPrototype} but waits for the module to be loaded.
 * @template T The type of the module to be returned.
 * @template P The type of the property keys to look for in the prototype.
 * @param args Either an array of property keys to look for in the prototype,
 * or an array containing the property keys and an optional configuration object.
 * @returns A promise that resolves to the module containing the specified prototype properties.
 * @see {@link getByPrototype}
 * @see {@link waitForModule}
 */
export async function waitForPrototype<T, P extends PropertyKey = keyof T>(
  ...args: [P[], WaitForOptions] | P[]
): Promise<T | RawModule<T>> {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as WaitForOptions | undefined)?.raw;

  const result = await (typeof args.at(-1) === "object"
    ? waitForModule<T>(filters.byPrototype(...props), args.at(-1) as WaitForOptions)
    : waitForModule<T>(filters.byPrototype(...props)));

  if (raw) {
    return result as RawModule<T>;
  }

  // We know this will always exist since filters.byPrototype will always return a module that has the props
  return getExportsForProps<T, P>(result as T, props, true)!;
}

// Get by store name

/**
 * Retrieves a store by its name from the collection of all available stores.
 * @template T The type of the store.
 * @param name The name of the store to retrieve.
 * @returns The store instance if found, otherwise `undefined`.
 */
export function getByStoreName<T extends Store>(name: string): T | undefined {
  const stores = flux.Store.getAll();
  return stores.find((store) => store.getName() === name) as T | undefined;
}

// Wait for store

export function waitForStore<T extends Store>(
  name: string,
  options?: WaitForOptions & { raw?: false },
): Promise<T>;
export function waitForStore<T extends Store>(
  name: string,
  options: WaitForOptions & { raw: true },
): Promise<RawModule<T>>;
export function waitForStore<T extends Store>(
  name: string,
  options?: WaitForOptions,
): Promise<T | RawModule<T>>;

/**
 * Waits for a specific module containing a store to be loaded and returns it.
 *
 * Like {@link getByStoreName} but waits for the module to be loaded.
 * @template T The type of the store.
 * @param name The name of the store to wait for.
 * @param options Optional configuration for waiting and module retrieval.
 * @returns A promise that resolves to the store instance or the raw module.
 * @throws {Error} Will throw an error if the store is not found in the module exports.
 * @see {@link getByStoreName}
 * @see {@link waitForModule}
 */
export async function waitForStore<T extends Store>(
  name: string,
  options?: WaitForOptions,
): Promise<T | RawModule<T>> {
  const raw = options?.raw ?? false;

  const result = await waitForModule<T>(filters.byStoreName(name), options);

  if (raw) {
    return result as RawModule<T>;
  }

  const store = getExportsForProps<T>(result as T, ["_dispatchToken"]);

  if (!store) {
    throw new Error(`Store "${name}" not found in module exports`);
  }

  return store;
}

// Get by value

export function getByValue<T>(
  match: string | RegExp,
  options?: { all?: false; raw?: false },
): T | undefined;
export function getByValue<T>(match: string | RegExp, options: { all: true; raw?: false }): T[];
export function getByValue<T>(
  match: string | RegExp,
  options: { all?: false; raw: true },
): RawModule<T> | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: { all: true; raw: true },
): Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options: { all: boolean; raw?: false },
): T | T[] | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: { all: boolean; raw: true },
): RawModule<T> | Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options: { all?: false; raw: boolean },
): T | RawModule<T> | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: { all: true; raw: boolean },
): T[] | Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;

/**
 * Retrieves a module by matching its exported values against a string or regular expression.
 *
 * Equivalent to `getModule(filters.byValue(match), options)`.
 * @template T The type of the module to be returned.
 * @param match A string or regular expression to match the module's value.
 * @param options Configuration options for the module retrieval.
 * @returns The matching module(s) or raw module(s), or `undefined` if no match is found.
 * @see {@link filters.byValue}
 * @see {@link getModule}
 */
export function getByValue<T>(
  match: string | RegExp,
  options: GetModuleOptions | undefined = { all: false, raw: false },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  return getModule<T>(filters.byValue(match), options);
}
