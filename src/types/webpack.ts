import { ModuleExports, RawModule } from './discord';

export type Filter = (module: RawModule) => boolean | ModuleExports;

export type RawLazyCallback = (module: RawModule) => void;
export type LazyCallback = (module: ModuleExports) => void;
export type LazyListener = [ Filter, RawLazyCallback ];
