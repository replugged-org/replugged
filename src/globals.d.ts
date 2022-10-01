// TODO: Scope global types to each component

import * as webpack from './renderer/modules/webpack';
import { Module } from './renderer/modules/webpack';

/* eslint-disable no-var */
declare global {
  export var appSettings: {
    set(setting: string, v: any): void;
  };

  interface Window {
    replugged: {
      webpack: typeof webpack;
    };
    webpackChunkdiscord_app: any[];
    wpCache: Module[];
  }
}

export {};
