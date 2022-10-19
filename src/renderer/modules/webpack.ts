import { ModuleExports, ModuleExportsWithProps, RawModule, RawModuleWithProps, WebpackChunk, WebpackChunkGlobal, WebpackModule, WebpackRequire } from '../../types/discord';
import { LazyCallback, Filter, LazyListener, RawLazyCallback, PlaintextPatch, RawPlaintextPatch } from '../../types/webpack';

export let wpRequire: WebpackRequire;

let signalReady: () => void;
export let ready = false;
export const waitForReady = new Promise<void>((resolve) => signalReady = () => {
  ready = true;
  resolve();
});

export let signalStart: () => void;
export const waitForStart = new Promise<void>((resolve) => signalStart = resolve);

export const sourceStrings: Record<number, string> = {};

const listeners = new Set<LazyListener>();
const plaintextPatches: RawPlaintextPatch[] = [];

function patchModuleSource (mod: WebpackModule): WebpackModule {
  const originalSource = mod.toString();

  const patchedSource = plaintextPatches.reduce((source, patch) => {
    if (patch.find && !(typeof patch.find === 'string' ? source.includes(patch.find) : patch.find.test(source))) {
      return source;
    }

    const result = patch.replacements.reduce((source, patch) => patch(source), source);

    if (result === source) {
      return source;
    }

    return result;
  }, originalSource);

  if (patchedSource === originalSource) {
    return mod;
  }

  // eslint-disable-next-line no-eval
  return eval(patchedSource);
}

function patchPush (webpackChunk: WebpackChunkGlobal) {
  let original = webpackChunk.push;

  async function handlePush (chunk: WebpackChunk) {
    await waitForStart;

    const modules = chunk[1];
    for (const id in modules) {
      const originalMod = modules[id];
      sourceStrings[id] = originalMod.toString();
      const mod = patchModuleSource(originalMod);
      modules[id] = function (module, exports, require) {
        mod(module, exports, require);

        for (const [ filter, callback ] of listeners) {
          if (filter(module)) {
            // eslint-disable-next-line callback-return
            callback(module);
          }
        }
      };
    }

    return original.call(webpackChunk, chunk);
  }

  Object.defineProperty(webpackChunk, 'push', {
    get: () => handlePush,
    set: (v) => (original = v),
    configurable: true
  });
}

function loadWebpackModules (webpackChunk: WebpackChunkGlobal) {
  wpRequire = webpackChunk.push([
    [ Symbol('replugged') ],
    {},
    (r: WebpackRequire) => r
  ]) as WebpackRequire;

  patchPush(webpackChunk);
  signalReady();
}


// Because using a timer is bad, thanks Venny-neko
// https://github.com/Vendicated/Vencord/blob/ef353f1d66dbf1d14e528830d267aac518ed1beb/src/webpack/patchWebpack.ts
let webpackChunk: WebpackChunkGlobal | undefined;

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
  return Object.values(wpRequire.c).find(filter);
}

export function getModule (filter: Filter): ModuleExports | undefined {
  const raw = getRawModule(filter);
  if (typeof raw !== 'undefined') {
    return getExports(raw);
  }
}

export function getAllRawModules (filter?: Filter): RawModule[] {
  const unfiltered = Object.values(wpRequire.c);
  if (filter) {
    return unfiltered.filter(filter);
  }
  return unfiltered;
}

export function getAllModules (filter?: Filter): (ModuleExports | undefined)[] {
  return getAllRawModules(filter).map(getExports);
}

function getExportsForProps <P extends string> (m: RawModule, props: P[]): ModuleExportsWithProps<P> | undefined {
  if (typeof m.exports === 'object') {
    return [ m.exports, ...Object.values(m.exports) ].find(o => typeof o === 'object' && o !== null && props.every(p => p in o)) as ModuleExportsWithProps<P> | undefined;
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

export function byPropsFilter <P extends string> (props: P[]) {
  return (m: RawModule): m is RawModuleWithProps<P> => Boolean(getExportsForProps(m, props));
}

export function getByProps <P extends string> (...props: P[]): ModuleExportsWithProps<P> | undefined {
  return byPropsInternal(props, false);
}

export function getRawByProps <P extends string> (...props: P[]): RawModuleWithProps<P> | undefined {
  return getRawModule(byPropsFilter(props)) as RawModuleWithProps<P> | undefined;
}

export function getRawById (id: number): RawModule | undefined {
  if (!(id in wpRequire.c)) {
    wpRequire(id);
  }

  return wpRequire.c[id];
}

export function getById (id: number): ModuleExports | undefined {
  const raw = getRawById(id);
  if (typeof raw !== 'undefined') {
    return getExports(raw);
  }
}

export function getAllByProps <P extends string> (...props: P[]): ModuleExportsWithProps<P>[] {
  return byPropsInternal(props, true);
}

export function getAllRawByProps <P extends string> (...props: P[]): RawModuleWithProps<P>[] {
  return getAllRawModules(byPropsFilter(props)) as RawModuleWithProps<P>[];
}

export function subscribeRaw (filter: Filter, callback: RawLazyCallback) {
  const raw = getRawModule(filter);
  if (raw) {
    // eslint-disable-next-line callback-return
    callback(raw);
  }

  const listener: LazyListener = [ filter, callback ];
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function subscribe (filter: Filter, callback: LazyCallback) {
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

function getIdBySource (match: string | RegExp): number | undefined {
  const isRegexp = match instanceof RegExp;
  const id = Object.entries(sourceStrings)
    .find(([ , source ]) => isRegexp ? match.test(source) : source.includes(match))?.[0];
  if (id) {
    return Number(id);
  }
}

function getAllIdBySource (match: string | RegExp): number[] {
  const isRegexp = match instanceof RegExp;
  return Object.entries(sourceStrings)
    .filter(([ , source ]) => isRegexp ? match.test(source) : source.includes(match))
    .map(([ id ]) => Number(id));
}

export function getRawBySource (match: string | RegExp): RawModule | undefined {
  const id = getIdBySource(match);
  if (typeof id !== 'undefined') {
    return getRawById(id);
  }
}

export function getBySource (match: string | RegExp): ModuleExports | undefined {
  const raw = getRawBySource(match);
  if (typeof raw !== 'undefined') {
    return getExports(raw);
  }
}

export function getAllRawBySource (match: string | RegExp): RawModule[] {
  return getAllIdBySource(match).map(getRawById).filter((m): m is RawModule => typeof m !== 'undefined');
}

export function getAllBySource (match: string | RegExp): ModuleExports[] {
  return getAllRawBySource(match).map(getExports).filter((m): m is ModuleExports => typeof m !== 'undefined');
}

export function patchPlaintext (patches: PlaintextPatch[]) {
  plaintextPatches.push(...patches.map(patch => ({ ...patch,
    replacements: patch.replacements.map(replacement => typeof replacement === 'function'
      ? replacement
      // Why? Because https://github.com/microsoft/TypeScript/issues/14107
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      : (source: string) => source.replace(replacement.match, replacement.replace)) })));
}
