import { UnknownFunction } from "./util";

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

export type WebpackRequireModule = Record<string | number, UnknownFunction>;

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

export type WebpackChunk = [
  Array<symbol | number>,
  Record<number, WebpackModule>,
  ((r: WebpackRequire) => unknown)?,
];

// Do NOT put `WebpackChunk[]` first, otherwise TS
// prioritizes Array.prototype.push over this custom
// push method and starts producing errors.
export type WebpackChunkGlobal = {
  push: (chunk: WebpackChunk) => unknown;
} & WebpackChunk[];

export interface CommandOptions {
  type: number;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  required?: boolean;
  choices?: Array<{
    name: string;
    values: string | number;
  }>;
  options?: CommandOptions[];
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: number[];
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
  autocomplete?: boolean;
}

export interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}
