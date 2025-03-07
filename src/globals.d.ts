/// <reference types="standalone-electron-types"/>

// TODO: Scope global types to each component

import type { WebpackChunkGlobal } from "./types/discord";
import type { ReCelledNativeType } from "./preload";

import type Lodash from "lodash";
declare global {
  export var appSettings: {
    set(setting: string, v: unknown): void;
  };

  interface Window {
    ReCelledNative: ReCelledNativeType;
    RepluggedNative: ReCelledNativeType;
    DiscordNative: typeof DiscordNative;
    replugged: typeof recelled;
    recelled: typeof recelled;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    webpackChunkdiscord_app: WebpackChunkGlobal;
    _: typeof _;
    $type?: (...args: unknown[]) => unknown;
  }

  export const ReCelledNative: ReCelledNativeType;
  export const RepluggedNative: ReCelledNativeType;
  export const replugged: typeof recelled;
  export const recelled: typeof recelled;

  export const DiscordNative: {
    app: {
      relaunch: () => void;
    };
    window: {
      setDevtoolsCallbacks(onOpened?: (() => void) | null, onClosed?: (() => void) | null): void;
      focus(): void;
    };
    clipboard: {
      copy: (text?: string) => void;
      cut: () => void;
      paste: () => void;
      read: () => string;
    };
  };

  export const _: typeof Lodash;
}

export {};
