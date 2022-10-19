import { ModuleExports, RawModule } from './discord';

export type Filter = (module: RawModule) => boolean | ModuleExports;

export type RawLazyCallback = (module: RawModule) => void;
export type LazyCallback = (module: ModuleExports) => void;
export type LazyListener = [ Filter, RawLazyCallback ];

export interface RegexReplacement {
  match: RegExp | string;
  replace: string | ((substring: string, ...args: unknown[]) => string);
}

export type PlaintextReplacer = (source: string) => string;
export interface PlaintextPatch {
  find?: string | RegExp;
  replacements: (PlaintextReplacer | RegexReplacement)[]
}

export interface RawPlaintextPatch {
  find?: string | RegExp;
  replacements: PlaintextReplacer[]
}
