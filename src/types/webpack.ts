export type ObjectExports = Record<PropertyKey, unknown>;

export type ModuleExports =
  | ObjectExports
  | ((...args: unknown[]) => unknown)
  | string
  | boolean
  | symbol;
export type ModuleExportsWithProps<P extends string> = Record<P, unknown> &
  Record<PropertyKey, unknown>;

export interface RawModule<T = unknown> {
  id: number;
  loaded: boolean;
  exports: T;
}

export type WebpackRawModules = Record<string | number, RawModule>;

export type WebpackRequire = ((e: number) => unknown) & {
  c?: WebpackRawModules;
  d: (module: unknown, exports: Record<string, () => unknown>) => void;
  m: WebpackChunk[1];
};

export type WebpackModule = (
  wpModule: RawModule,
  wpExports: typeof wpModule.exports,
  wpRequire: WebpackRequire,
) => void;

export type WebpackChunk = [
  Array<symbol | number>,
  Record<number, WebpackModule>,
  ((r: WebpackRequire) => unknown)?,
];

// Do NOT put `WebpackChunk[]` first, otherwise TS
// prioritizes Array.prototype.push over this custom
// push method and starts producing errors.
export type WebpackChunkGlobal = {
  push(chunk: WebpackChunk): unknown;
} & WebpackChunk[];

export type Filter = (module: RawModule) => boolean | ModuleExports;

export type LazyCallback<T> = (module: T) => void;
export type LazyListener<T = unknown> = [Filter, LazyCallback<RawModule<T>>];

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
  id: string;
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
