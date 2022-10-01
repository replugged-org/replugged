// TODO: Scope global types to each component
/* eslint-disable no-var */
declare global {
  export var appSettings: {
    set(setting: string, v: any): void;
  };

  interface Window {
    replugged: object;
    webpackChunkdiscord_app: any[];
  }
}

export {};
