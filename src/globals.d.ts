// TODO: Scope global types to each component

import { WebpackChunkGlobal } from './types/discord';
import * as replugged from './renderer/replugged';
import { RepluggedNativeType } from './preload';

 
declare global {
  export var appSettings: {
    set(setting: string, v: unknown): void;
  };

  interface Window {
    React: any;
    RepluggedNative: RepluggedNativeType;
    replugged: typeof replugged;
    webpackChunkdiscord_app: WebpackChunkGlobal;
  }
}

export {};
