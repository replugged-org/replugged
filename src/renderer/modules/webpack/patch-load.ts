import type {
  ModuleExports,
  WebpackChunk,
  WebpackChunkGlobal,
  WebpackRequire,
} from "../../../types";

import { listeners } from "./lazy";

import { patchModuleSource } from "./plaintext-patch";

export let wpRequire: WebpackRequire;

let signalReady: () => void;
let ready = false;

/**
 * @internal
 * @hidden
 */
export const waitForReady = new Promise<void>(
  (resolve) =>
    (signalReady = () => {
      ready = true;
      resolve();
    }),
);

/**
 * @internal
 * @hidden
 */
export let signalStart: () => void;

/**
 * @internal
 * @hidden
 */
export const waitForStart = new Promise<void>((resolve) => (signalStart = resolve));

export const sourceStrings: Record<number, string> = {};

function patchPush(webpackChunk: WebpackChunkGlobal): void {
  let original = webpackChunk.push;

  async function handlePush(chunk: WebpackChunk): Promise<unknown> {
    await waitForStart;

    const modules = chunk[1];
    for (const id in modules) {
      const originalMod = modules[id];
      sourceStrings[id] = originalMod.toString();
      const mod = patchModuleSource(originalMod);
      modules[id] = function (module, exports, require) {
        mod(module, exports, require);

        for (const [filter, callback] of listeners) {
          if (filter(module)) {
            callback(module);
          }
        }
      };
    }

    return original.call(webpackChunk, chunk);
  }

  Object.defineProperty(webpackChunk, "push", {
    get: () => handlePush,
    set: (v) => (original = v),
    configurable: true,
  });
}

function loadWebpackModules(webpackChunk: WebpackChunkGlobal): void {
  wpRequire = webpackChunk.push([[Symbol("replugged")], {}, (r: WebpackRequire) => r]);

  wpRequire.d = (module: ModuleExports, exports: Record<string, () => unknown>) => {
    for (const prop in exports) {
      if (Object.hasOwnProperty.call(exports, prop) && !Object.hasOwnProperty.call(module, prop)) {
        Object.defineProperty(module, prop, {
          enumerable: true,
          configurable: true,
          get: () => exports[prop](),
          set: (value) => (exports[prop] = () => value),
        });
      }
    }
  };

  patchPush(webpackChunk);
  signalReady();
}

// Because using a timer is bad, thanks Ven
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: WebpackChunkGlobal | undefined;

Object.defineProperty(window, "webpackChunkdiscord_app", {
  get: () => webpackChunk,
  set: (v) => {
    if (!ready && v?.push !== Array.prototype.push) {
      loadWebpackModules(v);
    }
    webpackChunk = v;
  },
  configurable: true,
});
