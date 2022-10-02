import { ModuleExports, RawModule, WebpackChunk, WebpackRequire } from '../../types/discord';

let instance: WebpackRequire;
let ready = false;

type Filter = (module: RawModule) => boolean | ModuleExports;

function patchPush (webpackChunk: typeof window.webpackChunkdiscord_app) {
  let original = webpackChunk.push;

  function handlePush (chunk: WebpackChunk) {
    return original.call(webpackChunk, chunk);
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

function getExports (m: RawModule): RawModule | ModuleExports | unknown {
  if (typeof m.exports === 'object') {
    const exportKeys = Object.keys(m.exports);
    if (exportKeys.length === 1 && [ 'default', 'Z' ].includes(exportKeys[0])) {
      return Object.values(m.exports)[0];
    }
  }
  return m.exports;
}

export function getModule (filter?: Filter): ModuleExports | unknown | undefined {
  if (!filter) {
    return;
  }
  return Object.values(instance.c).find(filter);
}

export function getRawModule (filter?: Filter): RawModule | undefined {
  if (!filter) {
    return;
  }
  return Object.values(instance.c).find(filter);
}

export function getAllRawModules (filter?: Filter): RawModule[] {
  const unfiltered = Object.values(instance.c);
  if (filter) {
    return unfiltered.filter(filter);
  }
  return unfiltered;
}

export function getAllModules (filter?: Filter): (RawModule | ModuleExports | unknown)[] {
  return getAllRawModules(filter).map(getExports);
}

function getExportsForProps (m: RawModule, props: string[]): RawModule | ModuleExports | unknown | undefined {
  if (typeof m.exports === 'object') {
    return [ m.exports, ...Object.values(m.exports) ].find(o => typeof o === 'object' && o !== null && props.every(p => Object.keys(o).includes(p)));
  }
}

function byPropsInternal (props: string[], all = false): RawModule | ModuleExports | unknown | undefined {
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
  return result;
}

function byPropsFilter (props: string[]) {
  return (m: RawModule) => Boolean(getExportsForProps(m, props));
}

export function getByProps (...props: string[]): RawModule | ModuleExports | unknown | undefined {
  return byPropsInternal(props, false);
}

export function getRawByProps (...props: string[]): RawModule | undefined {
  return getRawModule(byPropsFilter(props));
}

export function getAllByProps (...props: string[]): (RawModule | ModuleExports | unknown) {
  return byPropsInternal(props, true);
}

export function getAllRawByProps (...props: string[]): RawModule[] {
  return getAllRawModules(byPropsFilter(props));
}
