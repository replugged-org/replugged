import type {
  GetModuleOptions,
  ModuleExports,
  ModuleExportsWithProps,
  RawModule,
  WaitForOptions,
} from "src/types";
import { getExportsForProps, getModule } from "./get-modules";
import * as filters from "./filters";
import { waitForModule } from "./lazy";

export function getBySource<T extends ModuleExports = ModuleExports>(
  match: string | RegExp,
  options?: { all?: false; raw?: false },
): T | undefined;
export function getBySource<T extends ModuleExports = ModuleExports>(
  match: string | RegExp,
  options?: { all?: true; raw?: false },
): T[];
export function getBySource<T extends RawModule = RawModule>(
  match: string | RegExp,
  options?: { all?: false; raw?: true },
): T | undefined;
export function getBySource<T extends RawModule = RawModule>(
  match: string | RegExp,
  options?: { all?: true; raw?: true },
): T[];
export function getBySource<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  match: string | RegExp,
  options?: { all?: boolean; raw?: boolean },
): T[] | T | undefined;

/**
 * Equivalent to `getModule(filters.bySource(match), options)`
 * *
 * @see {@link filters.bySource}
 * @see {@link getModule}
 */
export function getBySource<T extends ModuleExports | RawModule = ModuleExports | RawModule>(
  match: string | RegExp,
  options: GetModuleOptions | undefined = {
    all: false,
    raw: false,
  },
): T[] | T | undefined {
  return getModule(filters.bySource(match), options);
}

export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(props: P[], options: { all?: false; raw?: false }): T | undefined;
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(props: P[], options: { all?: true; raw?: false }): T[];
export function getByProps<P extends string = string, T extends RawModule = RawModule>(
  props: P[],
  options: { all?: false; raw?: true },
): T | undefined;
export function getByProps<P extends string = string, T extends RawModule = RawModule>(
  props: P[],
  options: { all?: true; raw?: true },
): T[];
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(props: P[], options?: { all?: boolean; raw?: boolean }): T[] | T | undefined;
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(...props: P[]): T | undefined;

/**
 * Equivalent to `getModule(filters.byProps(...props), options)`
 *
 * @see {@link filters.byProps}
 * @see {@link getModule}
 */
export function getByProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(...args: [P[], GetModuleOptions] | P[]): T[] | T | undefined {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as GetModuleOptions)?.raw;

  const result = (
    typeof args.at(-1) === "object"
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

export function waitForProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(props: P[], options: WaitForOptions & { raw?: false }): Promise<T>;
export function waitForProps<P extends string = string, T extends RawModule = RawModule>(
  props: P[],
  options: WaitForOptions & { raw?: true },
): Promise<T>;
export function waitForProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(props: P[], options?: WaitForOptions): Promise<T>;
export function waitForProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(...props: P[]): Promise<T>;

/**
 * Like {@link getByProps} but waits for the module to be loaded.
 *
 * @see {@link getByProps}
 * @see {@link waitForModule}
 */
export async function waitForProps<
  P extends string = string,
  T extends ModuleExportsWithProps<P> | RawModule = ModuleExportsWithProps<P> | RawModule,
>(...args: [P[], WaitForOptions] | P[]): Promise<T> {
  const props = (typeof args[0] === "string" ? args : args[0]) as P[];
  const raw = typeof args[0] === "string" ? false : (args[1] as WaitForOptions)?.raw;

  const result = (await (typeof args.at(-1) === "object"
    ? waitForModule(filters.byProps(...props), args.at(-1) as WaitForOptions)
    : waitForModule(filters.byProps(...props)))) as ModuleExportsWithProps<P> | RawModule;

  if (raw) {
    return result as T & RawModule;
  }

  // We know this will always exist since filters.byProps will always return a module that has the props
  return getExportsForProps<P, T & ModuleExportsWithProps<P>>(result as T & ModuleExports, props)!;
}
