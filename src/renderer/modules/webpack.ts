import { WebpackInstance } from 'discord-types/other';

type Exports = Record<string, unknown> | ((...args: unknown[]) => unknown) | string;

export type RawModule = Record<string, unknown> & {
  id: number;
  loaded: boolean;
  exports: Exports
};

class Module {
  public id: number;
  public exports: Exports;
  public loaded: boolean;

  constructor (module: RawModule) {
    Object.assign(this, module.props);

    this.id = module.id;
    this.exports = module.exports;
    this.loaded = module.loaded;
  }

  public findExportForProps (...props: string[]): Record<string, unknown> | null {
    if (!this.exports || typeof this.exports !== 'object') {
      return null;
    }

    const objectExports = Object.values(this.exports).filter(x => typeof x === 'object') as Record<string, unknown>[];

    return objectExports.find(x => props.every(prop => Object.keys(x).includes(prop))) ?? null;
  }
}

type ModuleType = typeof Module & Record<string, unknown>;

let instance: WebpackInstance;
let ready = false;

function patchPush (webpackChunk: typeof window.webpackChunkdiscord_app) {
  let original = webpackChunk.push;

  function handlePush (chunk: [unknown, Record<number, RawModule>]) {
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
    // eslint-disable-next-line symbol-description
    [ Symbol() ],
    {},
    (r: WebpackInstance) => r
  ]);

  patchPush(webpackChunk);

  ready = true;
}

// Because using a timer is bad, thanks venny-neko
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: typeof window.webpackChunkdiscord_app | undefined;

Object.defineProperty(window, 'webpackChunkdiscord_app', {
  get: () => webpackChunk,
  set: (v) => {
    if (v?.push !== Array.prototype.push && !ready) {
      loadWebpackModules(v);
    }
    webpackChunk = v;
  },
  configurable: true
});

export function getRawModules () {
  return Object.values(instance.c) as RawModule[];
}

type Filter = (module: RawModule) => boolean | Exports;

export function getAllModules (filter?: Filter | undefined): ModuleType[] {
  return getRawModules()
    .map(m => {
      const isMatch = !filter || filter(m);
      if (!isMatch) {
        return;
      }

      m.props = typeof m.exports === 'object' ? m.exports : {};

      return new Module(m);
    })
    .filter(Boolean) as unknown as ModuleType[];
}

export const getModule = (filter: Filter): ModuleType | null => getAllModules(filter)[0] ?? null;

export function getAllByProps (...props: string[]): ModuleType[] {
  return getRawModules()
    .map(m => {
      if (!m.exports || typeof m.exports !== 'object') {
        return;
      }

      const result = [ m.exports, ...Object.values(m.exports) ].find(x => x && props.every(prop => Object.keys(x).includes(prop)));
      if (!result) {
        return;
      }

      m.props = result;

      return new Module(m);
    })
    .filter(Boolean) as unknown as ModuleType[];
}

export const getByProps = (...props: string[]): ModuleType | null => getAllByProps(...props)[0] ?? null;
