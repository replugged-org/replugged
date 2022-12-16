import { ModuleExports, RawModule } from "./discord";

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
