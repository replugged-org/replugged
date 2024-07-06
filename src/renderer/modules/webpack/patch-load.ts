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

const patchedModules = new Set<string>();

/**
 * Original stringified module (without plaintext patches applied) for source searches
 * @internal
 * @hidden
 */
export const sourceStrings: Record<number, string> = {};

function patchChunk(chunk: WebpackChunk): void {
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

  function handlePush(chunk: WebpackChunk): unknown {
    patchChunk(chunk);
    return original.call(webpackChunk, chunk);
  }

  // From YofukashiNo: https://discord.com/channels/1000926524452647132/1000955965304221728/1258946431348375644
  handlePush.bind = original.bind.bind(original);

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
        // The first batch of modules are added inline via r.m rather than being pushed
        patchChunk([[], r.m]);

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
      patchChunk(loadedChunk);
    }
  }

  patchPush(chunksGlobal);
}

// Intercept the webpack chunk global as soon as Discord creates it
export function interceptChunksGlobal(): void {
  if (window.webpackChunkdiscord_app) {
    loadWebpackModules(window.webpackChunkdiscord_app);
  } else {
    let webpackChunk: WebpackChunkGlobal | undefined;
    Object.defineProperty(window, "webpackChunkdiscord_app", {
      get: () => webpackChunk,
      set: (v) => {
        // Only modify if the global has actually changed
        // We don't need to check if push is the special webpack push,
        // because webpack will go over the previously loaded modules
        // when it sets the custom push method.
        if (v !== webpackChunk) {
          loadWebpackModules(v);
        }
        webpackChunk = v;
      },
      configurable: true,
    });
  }
}
