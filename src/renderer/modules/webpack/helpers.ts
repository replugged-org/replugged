import type { GetModuleOptions, RawModule, WaitForOptions } from "src/types";
import { getExportsForProps, getModule } from "./get-modules";
import * as filters from "./filters";
import Flux, { Store } from "../common/flux";
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
 * Equivalent to `getModule(filters.bySource(match), options)`
 *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 */
export function getBySource<T>(
  match: string | RegExp,
  options: GetModuleOptions = {
    all: false,
    raw: false,
  },
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
  props: P,
  options: { all?: boolean; raw?: false },
): T | T[] | undefined;
export function getByProps<T, P extends PropertyKey = keyof T>(
  props: P[],
  options?: { all?: boolean; raw?: boolean },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;
export function getByProps<T, P extends PropertyKey[] = Array<keyof T>>(...props: P): T | undefined;

/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
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
 * Like {@link getByProps} but waits for the module to be loaded.
 *
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

// Get by value

export function getByValue<T>(
  match: string | RegExp,
  options?: {
    all?: false;
    raw?: false;
  },
): T | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all: true;
    raw?: false;
  },
): T[];
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all?: false;
    raw: true;
  },
): RawModule<T> | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all: true;
    raw: true;
  },
): Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all: boolean;
    raw?: false;
  },
): T | T[] | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all: boolean;
    raw: true;
  },
): RawModule<T> | Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all?: false;
    raw: boolean;
  },
): T | RawModule<T> | undefined;
export function getByValue<T>(
  match: string | RegExp,
  options: {
    all: true;
    raw: boolean;
  },
): T[] | Array<RawModule<T>>;
export function getByValue<T>(
  match: string | RegExp,
  options?: {
    all?: boolean;
    raw?: boolean;
  },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined;
/**
 * Equivalent to `getModule(filters.byValue(match), options)`
 * @param match The string to check the value against
 *
 * @see {@link filters.byValue}
 */
export function getByValue<T>(
  match: string | RegExp,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): T | T[] | RawModule<T> | Array<RawModule<T>> | undefined {
  return getModule<T>(filters.byValue(match), options);
}

export function getByStoreName<T extends Store>(name: string): T | undefined {
  const stores = Flux.Store.getAll();
  return stores.find((store) => store.getName() === name) as T | undefined;
}
