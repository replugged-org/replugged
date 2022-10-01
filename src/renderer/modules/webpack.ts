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
    (r: ((i: number) => unknown) & { c: RawModule[] }) => r.c
  ]));
}

type Filter = (module: RawModule) => boolean | Exports;

export function getAllModules (filter?: Filter | undefined): ModuleType[] {
  return window.wpCache
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
  return window.wpCache
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
