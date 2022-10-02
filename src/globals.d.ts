// TODO: Scope global types to each component

import { WebpackChunkGlobal } from './types/discord';
import { replugged } from './renderer';
import { RepluggedNativeType } from './preload';

/* eslint-disable no-var */
declare global {
  export var appSettings: {
    set(setting: string, v: any): void;
  };

  interface Window {
    RepluggedNative: RepluggedNativeType;
    replugged: typeof replugged;
    webpackChunkdiscord_app: WebpackChunkGlobal;
  }
}

export {};
