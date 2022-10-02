// TODO: Scope global types to each component

import * as webpack from './renderer/modules/webpack';
import { WebpackChunk } from './types/discord';

/* eslint-disable no-var */
declare global {
  export var appSettings: {
    set(setting: string, v: any): void;
  };

  interface Window {
    RepluggedNative: import('./preload').RepluggedNativeType;
    replugged: {
      webpack: typeof webpack;
    };
    webpackChunkdiscord_app: {
      push: (chunk: WebpackChunk) => unknown;
    } & WebpackChunk[];
  }
}

export {};
