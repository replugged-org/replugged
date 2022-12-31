// TODO: Scope global types to each component

import { WebpackChunkGlobal } from "./types/discord";
import * as replugged from "./renderer/replugged";
import { RepluggedNativeType } from "./preload";

declare global {
  export var appSettings: {
    set(setting: string, v: unknown): void;
  };

  interface Window {
    RepluggedNative: RepluggedNativeType;
    replugged: typeof replugged;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    webpackChunkdiscord_app: WebpackChunkGlobal;
  }

  export const DiscordNative: {
    window: {
      setDevtoolsCallbacks(onOpened?: (() => void) | null, onClosed?: (() => void) | null): void;
    };
  };
}

export {};
