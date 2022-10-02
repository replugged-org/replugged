export type ModuleExports = Record<string, unknown> | ((...args: unknown[]) => unknown) | string;

export interface RawModule {
  id: string | number;
  loaded: boolean;
  exports: ModuleExports;
}

export type WebpackRequireCache = Record<string | number, RawModule>;

export type WebpackRequire = ((e: number) => ModuleExports) & {
  c: WebpackRequireCache;
};

export type WebpackChunk = [
  (symbol | number)[],
  Record<number, (
    wpModule: { exports: ModuleExports },
    wpExports: typeof wpModule.exports,
    wpRequire: WebpackRequire
  ) => void>,
  ((r: WebpackRequire) => unknown)?
];

export type WebpackChunkGlobal = WebpackChunk[] & {
  push: (chunk: WebpackChunk) => unknown;
};
