import type {
  WebpackChunk,
  WebpackChunkGlobal,
  WebpackRawModules,
  WebpackRequire,
} from "../../../types";

import { listeners } from "./lazy";

import { patchModuleSource } from "./plaintext-patch";

/**
 * Webpack's require function
 * @internal
 * @hidden
 */
export let wpRequire: WebpackRequire | undefined;
export let webpackChunks: WebpackRawModules | undefined;

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

const patchedModules = new Set<string>();

/**
 * Original stringified module (without plaintext patches applied) for source searches
 * @internal
 * @hidden
 */
export const sourceStrings: Record<number, string> = {};

async function patchChunk(chunk: WebpackChunk): Promise<void> {
  await waitForStart;
  const modules = chunk[1];
  for (const id in modules) {
    if (patchedModules.has(id)) continue;
    patchedModules.add(id);
    const originalMod = modules[id];
    sourceStrings[id] = originalMod.toString();
    const mod = patchModuleSource(originalMod, id);
    modules[id] = function (module, exports, require) {
      mod(module, exports, require);

      for (const [filter, callback] of listeners) {
        try {
          if (filter(module)) {
            callback(module);
          }
        } catch {}
      }
    };
    modules[id].toString = () => sourceStrings[id];
  }
}

/**
 * Patch the push method of window.webpackChunkdiscord_app
 * @param webpackChunk Webpack chunk global
 * @internal
 */
function patchPush(webpackChunk: WebpackChunkGlobal): void {
  let original = webpackChunk.push;

  async function handlePush(chunk: WebpackChunk): Promise<unknown> {
    await patchChunk(chunk);
    return original.call(webpackChunk, chunk);
  }

  // https://github.com/Vendicated/Vencord/blob/e4701769a5b8e0a71dba0e26bc311ff6e34eadf7/src/webpack/patchWebpack.ts#L93-L98
  handlePush.bind = (...args: unknown[]) => original.bind([...args]);

  Object.defineProperty(webpackChunk, "push", {
    get: () => handlePush,
    set: (v) => (original = v),
    configurable: true,
  });
}

/**
 * Modify the webpack chunk global and signal it to begin operations
 * @param webpackChunk Webpack chunk global
 * @internal
 */
function loadWebpackModules(chunksGlobal: WebpackChunkGlobal): void {
  chunksGlobal.push([
    [Symbol("replugged")],
    {},
    (r: WebpackRequire | undefined) => {
      wpRequire = r!;
      if (wpRequire.c && !webpackChunks) webpackChunks = wpRequire.c;

      if (r) {
        r.d = (module: unknown, exports: Record<string, () => unknown>) => {
          for (const prop in exports) {
            if (
              Object.hasOwnProperty.call(exports, prop) &&
              !Object.hasOwnProperty.call(module, prop)
            ) {
              Object.defineProperty(module, prop, {
                enumerable: true,
                configurable: true,
                get: () => exports[prop](),
                set: (value) => (exports[prop] = () => value),
              });
            }
          }
        };
      }
    },
  ]);

  // Patch previously loaded chunks
  if (Array.isArray(chunksGlobal)) {
    for (const loadedChunk of chunksGlobal) {
      void patchChunk(loadedChunk);
    }
  }

  patchPush(chunksGlobal);
  signalReady();

  // There is some kind of race condition where chunks are not patched ever, so this should make sure everything gets patched
  // This is a temporary workaround that should be removed once we figure out the real cause
  setInterval(() => {
    if (Array.isArray(chunksGlobal)) {
      for (const loadedChunk of chunksGlobal) {
        void patchChunk(loadedChunk);
      }
    }
  }, 1000);
}

// Intercept the webpack chunk global as soon as Discord creates it

// Because using a timer is bad, thanks Ven
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: WebpackChunkGlobal | undefined;

if (window.webpackChunkdiscord_app) {
  webpackChunk = window.webpackChunkdiscord_app;
  loadWebpackModules(webpackChunk!);
} else {
  Object.defineProperty(window, "webpackChunkdiscord_app", {
    get: () => webpackChunk,
    set: (v) => {
      // Only modify if the global has actually changed
      // We don't need to check if push is the special webpack push,
      // because webpack will go over the previously loaded modules
      // when it sets the custom push method.
      if (v !== webpackChunk && !ready) {
        loadWebpackModules(v);
      }
      webpackChunk = v;
    },
    configurable: true,
  });
}
