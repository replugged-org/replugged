// TODO: Scope global types to each component

import { WebpackChunkGlobal } from './types/discord';
import * as replugged from './renderer/replugged';
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
