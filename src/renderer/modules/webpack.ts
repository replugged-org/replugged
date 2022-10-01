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

  public findExportForProps (props: string | string[]): Record<string, unknown> | null {
    if (!Array.isArray(props)) {
      props = [ props ];
    }

    if (!this.exports || typeof this.exports !== 'object') {
      return null;
    }

    const objectExports = Object.values(this.exports).filter(x => typeof x === 'object') as Record<string, unknown>[];

    return objectExports.find(x => (props as string[]).every(prop => Object.keys(x).includes(prop))) ?? null;
  }
}

type ModuleType = typeof Module & Record<string, unknown>;

// @todo Probably want to store this elsewhere
if (!window.wpCache) {
  window.wpCache = [];
}

export async function loadWebpackModules () {
  while (!window.webpackChunkdiscord_app) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // @todo Figure out a better way to know when it's ready
  await new Promise(resolve => setTimeout(resolve, 5_000));

  if (window.wpCache.length) {
    return;
  }

  window.wpCache = Object.values(window.webpackChunkdiscord_app.push([
    // eslint-disable-next-line symbol-description
    [ Symbol() ],
    {},
    (r: Record<string, unknown>) => r.c
  ]));
}

type Filter = (module: RawModule) => boolean | Exports;

export function getModule (filter: Filter | Filter[], all: true): ModuleType[];
export function getModule (filter: Filter | Filter[], all?: false | undefined): ModuleType | null;
export function getModule (filter: Filter | Filter[], all = false): ModuleType | ModuleType[] | null {
  if (!Array.isArray(filter)) {
    filter = [ filter ];
  }

  const matchingModules = window.wpCache
    .map(m => {
      const isMatch = (filter as Filter[]).every(f => f(m));
      if (!isMatch) {
        return;
      }

      m.props = m.exports;

      return new Module(m);
    })
    .filter(Boolean) as unknown as ModuleType[];

  if (!all) {
    return matchingModules[0] || null;
  }

  return matchingModules;
}

export function getByProps (props: string | string[], all: true): ModuleType[];
export function getByProps (props: string | string[], all?: false | undefined): ModuleType | null;
export function getByProps (props: string | string[], all = false): ModuleType | ModuleType[] | null {
  if (!Array.isArray(props)) {
    props = [ props ];
  }

  const matchingModules = window.wpCache
    .map(m => {
      if (!m.exports || typeof m.exports !== 'object') {
        return;
      }

      const result = Object.values(m.exports).find(x => x && (props as string[]).every(prop => Object.keys(x).includes(prop)));
      if (!result) {
        return;
      }

      m.props = result;

      return new Module(m);
    })
    .filter(Boolean) as unknown as ModuleType[];

  if (!all) {
    return matchingModules[0] || null;
  }

  return matchingModules;
}
