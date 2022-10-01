function getAllExportsForModule (module: RawModule): (Record<string, unknown> | null)[] {
  const { exports } = module;
  if (!exports || typeof exports !== 'object') {
    return [];
  }
  // Return array with exports and all the objects it exports
  return [ exports, ...Object.values(exports).filter(x => typeof x === 'object') as Record<string, unknown>[] ];
}

export const filters = {
  byProps: (props: string | string[]) => {
    if (!Array.isArray(props)) {
      props = [ props ];
    }

    return (m: RawModule) => {
      const exports = getAllExportsForModule(m);
      return exports.find(x => x && (props as string[]).every(prop => Object.keys(x).includes(prop)));
    };
  }
  // byString: () => {}
};

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

type FilterFunction = (module: RawModule) => boolean | Exports;
type Filter = string | FilterFunction;

export function getModule (filter: Filter | Filter[], all: true): ModuleType[];
export function getModule (filter: Filter | Filter[], all: false | undefined): ModuleType | null;
export function getModule (filter: Filter | Filter[], all = false): ModuleType | ModuleType[] | null {
  if (!Array.isArray(filter)) {
    filter = [ filter ];
  }
  const filterFunctionArray = filter.map(f => typeof f === 'string' ? filters.byProps(f) : f);

  const matchingModules = window.wpCache
    .map(m => {
      const result = filterFunctionArray.map(f => f(m)).filter(Boolean);
      if (!result.length) {
        return;
      }
      const isAllObjects = result.every(x => typeof x === 'object');
      if (isAllObjects) {
        m.props = {};
        result.forEach(x => Object.assign(m.props, x));
      } else {
        m.props = m.exports;
      }

      return new Module(m);
    })
    .filter(Boolean) as unknown as ModuleType[];

  if (!all) {
    return matchingModules[0] || null;
  }

  return matchingModules;
}
