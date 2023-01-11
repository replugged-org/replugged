export type ObjectExports = Record<string, unknown>;

export type ModuleExports =
  | ObjectExports
  | ((...args: unknown[]) => unknown)
  | string
  | boolean
  | symbol;
export type ModuleExportsWithProps<P extends string> = Record<P, unknown> &
  Record<PropertyKey, unknown>;

export interface RawModule {
  id: number;
  loaded: boolean;
  exports: ModuleExports;
}

export interface RawModuleWithProps<P extends string> extends RawModule {
  exports: ModuleExportsWithProps<P>;
}

export type WebpackRequireCache = Record<string | number, RawModule>;

export type WebpackRequire = ((e: number) => ModuleExports) & {
  c: WebpackRequireCache;
  d: (module: ModuleExports, exports: Record<string, () => unknown>) => void;
  m: WebpackChunk;
};

export type WebpackModule = (
  wpModule: RawModule,
  wpExports: typeof wpModule.exports,
  wpRequire: WebpackRequire,
) => void;

export type WebpackChunk = [Array<symbol | number>, Record<number, WebpackModule>];

// Do NOT put `WebpackChunk[]` first, otherwise TS
// prioritizes Array.prototype.push over this custom
// push method and starts producing errors.
export type WebpackChunkGlobal = {
  push(chunk: WebpackChunk): void;
  push<T extends (r: WebpackRequire) => unknown>(chunk: [...WebpackChunk, T]): ReturnType<T>;
} & WebpackChunk[];

export type Filter = (module: RawModule) => boolean | ModuleExports;

export type RawLazyCallback<T extends RawModule = RawModule> = (module: T) => void;
export type LazyCallback<T extends ModuleExports = ModuleExports> = (module: T) => void;
export type LazyListener<T extends RawModule = RawModule> = [Filter, RawLazyCallback<T>];

export interface RegexReplacement {
  match: RegExp | string;
  replace: string | ((substring: string, ...args: unknown[]) => string);
}

export type PlaintextReplacer = (source: string) => string;
export interface PlaintextPatch {
  find?: string | RegExp;
  check?: (source: string) => boolean;
  replacements: Array<PlaintextReplacer | RegexReplacement>;
}

export interface RawPlaintextPatch {
  find?: string | RegExp;
  check?: (source: string) => boolean;
  replacements: PlaintextReplacer[];
}

export interface GetModuleOptions {
  /** Return all matches instead of just the first */
  all?: boolean;
  /** Return the raw module instead of the exports */
  raw?: boolean;
}

export interface WaitForOptions {
  /** Return the raw module instead of the exports */
  raw?: boolean;
  /** If nothing is found after this delay (ms), stop and throw an error. */
  timeout?: number;
}
