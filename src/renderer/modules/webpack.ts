import { ModuleExports, RawModule, WebpackChunk, WebpackRequire } from '../../types/discord';

export let instance: WebpackRequire;
export let ready = false;

const listeners = new Set<Listener>();

type Filter = (module: RawModule) => boolean | ModuleExports;

function patchPush (webpackChunk: typeof window.webpackChunkdiscord_app) {
  let original = webpackChunk.push;

  function handlePush (chunk: WebpackChunk) {
    const modules = chunk[1];

    for (const id in modules) {
      const mod = modules[id];
      modules[id] = function (module, exports, require) {
        mod(module, exports, require);

        for (const [ filter, callback ] of listeners) {
          if (filter(module)) {
            // eslint-disable-next-line callback-return
            callback(module);
          }
        }
      };
      return original.call(webpackChunk, chunk);
    }
  }

  Object.defineProperty(webpackChunk, 'push', {
    get: () => handlePush,
    set: (v) => (original = v),
    configurable: true
  });
}

function loadWebpackModules (webpackChunk: typeof window.webpackChunkdiscord_app) {
  instance = webpackChunk.push([
    [ Symbol('replugged') ],
    {},
    (r: WebpackRequire) => r
  ]) as WebpackRequire;

  patchPush(webpackChunk);

  ready = true;
}


// Because using a timer is bad, thanks venny-neko
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: typeof window.webpackChunkdiscord_app | undefined;

Object.defineProperty(window, 'webpackChunkdiscord_app', {
  get: () => webpackChunk,
  set: (v) => {
    if (!ready && v?.push !== Array.prototype.push) {
      loadWebpackModules(v);
    }
    webpackChunk = v;
  },
  configurable: true
});

function getExports (m: RawModule): ModuleExports | undefined {
  if (typeof m.exports === 'object') {
    const exportKeys = Object.keys(m.exports);
    if (exportKeys.length === 1 && [ 'default', 'Z' ].includes(exportKeys[0])) {
      return Object.values(m.exports)[0] as ModuleExports;
    }
  }
  return m.exports;
}

export function getRawModule (filter: Filter): RawModule | undefined {
  return Object.values(instance.c).find(filter);
}

export function getModule (filter: Filter): ModuleExports | undefined {
  const raw = getRawModule(filter);
  if (typeof raw !== 'undefined') {
    return getExports(raw);
  }
}

export function getAllRawModules (filter?: Filter): RawModule[] {
  const unfiltered = Object.values(instance.c);
  if (filter) {
    return unfiltered.filter(filter);
  }
  return unfiltered;
}

export function getAllModules (filter?: Filter): (ModuleExports | undefined)[] {
  return getAllRawModules(filter).map(getExports);
}

type ModuleExportsWithProps<P extends string> = Record<P, unknown> & Record<PropertyKey, unknown>;
export interface RawModuleWithProps<P extends string> extends RawModule {
  exports: ModuleExportsWithProps<P>;
}

function getExportsForProps <P extends string> (m: RawModule, props: P[]): ModuleExportsWithProps<P> | undefined {
  if (typeof m.exports === 'object') {
    return [ m.exports, ...Object.values(m.exports) ].find(o => typeof o === 'object' && o !== null && props.every(p => Object.keys(o).includes(p))) as ModuleExportsWithProps<P> | undefined;
  }
}
function byPropsInternal <P extends string> (props: P[], all: true): ModuleExportsWithProps<P>[];
function byPropsInternal <P extends string> (props: P[], all?: false): ModuleExportsWithProps<P> | undefined;
function byPropsInternal <P extends string> (props: P[], all = false): (ModuleExportsWithProps<P> | undefined) | ModuleExportsWithProps<P>[] {
  const result = [];
  for (const m of getAllRawModules()) {
    const exp = getExportsForProps(m, props);
    if (exp) {
      if (all) {
        result.push(exp);
      } else {
        return exp;
      }
    }
  }
  if (all) {
    return result;
  }
}

function byPropsFilter <P extends string> (props: P[]) {
  return (m: RawModule): m is RawModuleWithProps<P> => Boolean(getExportsForProps(m, props));
}

export function getByProps <P extends string> (...props: P[]): ModuleExportsWithProps<P> | undefined {
  return byPropsInternal(props, false);
}

export function getRawByProps <P extends string> (...props: P[]): RawModuleWithProps<P> | undefined {
  return getRawModule(byPropsFilter(props)) as RawModuleWithProps<P> | undefined;
}

export function getAllByProps <P extends string> (...props: P[]): ModuleExportsWithProps<P>[] {
  return byPropsInternal(props, true);
}

export function getAllRawByProps <P extends string> (...props: P[]): RawModuleWithProps<P>[] {
  return getAllRawModules(byPropsFilter(props)) as RawModuleWithProps<P>[];
}

type RawCallback = (module: RawModule) => void;
type Listener = [ Filter, RawCallback ];

export function subscribeRaw (filter: Filter, callback: RawCallback) {
  const raw = getRawModule(filter);
  if (raw) {
    // eslint-disable-next-line callback-return
    callback(raw);
  }

  const listener: Listener = [ filter, callback ];
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

type Callback = (module: ModuleExports) => void;

export function subscribe (filter: Filter, callback: Callback) {
  return subscribeRaw(filter, (raw) => {
    if (typeof raw !== 'undefined') {
      const exports = getExports(raw);
      if (typeof exports !== 'undefined') {
        return callback(exports);
      }
    }
  });
}

export function waitForRaw (filter: Filter): Promise<RawModule> {
  return new Promise((resolve) => {
    const unregister = subscribeRaw(filter, (raw) => {
      unregister();
      resolve(raw);
    });
  });
}

export function waitFor (filter: Filter): Promise<ModuleExports> {
  return new Promise((resolve) => {
    const unregister = subscribe(filter, (exports) => {
      unregister();
      resolve(exports);
    });
  });
}
