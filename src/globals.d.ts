/// <reference types="standalone-electron-types"/>

// TODO: Scope global types to each component

import type Lodash from "lodash";
import type { RepluggedNativeType } from "./preload";
import type * as replugged from "./renderer/replugged";
import type { WebpackChunkGlobal } from "./types";

declare global {
  // eslint-disable-next-line no-var
  export var appSettings: {
    set(setting: string, v: unknown): void;
  };

  interface Window {
    RepluggedNative: RepluggedNativeType;
    DiscordNative: typeof DiscordNative;
    replugged: typeof replugged;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    webpackChunkdiscord_app: WebpackChunkGlobal;
    _: typeof _;
  }

  export const RepluggedNative: RepluggedNativeType;

  export const DiscordNative: {
    app: {
      relaunch: () => void;
    };
    window: {
      focus(): void;
    };
    clipboard: {
      copy: (text?: string) => void;
      cut: () => void;
      paste: () => void;
      read: () => string;
    };
    process: { platform: string };
  };

  export const _: typeof Lodash;
}

export {};
