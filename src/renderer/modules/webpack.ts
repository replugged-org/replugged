import assert from 'assert';

function getAllExportsForModule (module: Module): (Record<string, unknown> | null)[] {
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

    return (m: Module) => {
      const keysInModule  = getAllExportsForModule(m).flatMap(x => x && Object.keys(x)).filter(Boolean);
      return (props as string[]).every(prop => keysInModule.includes(prop));
    };
  }
  // byString: () => {}
};

export type Module = Record<string, unknown> & {
  id: number;
  loaded: boolean;
  exports: Record<string, unknown> | ((...args: unknown[]) => unknown) | string;
};

// @todo Probably want to store this elsewhere
if (!window.wpCache) {
  window.wpCache = [];
}

export async function loadWebpackModules () {
  while (!window.webpackChunkdiscord_app) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

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

type FilterFunction = (module: Module) => boolean;
type Filter = string | FilterFunction;

export function getModule (filter: Filter | Filter[], all: true): Module[];
export function getModule (filter: Filter | Filter[], all: false | undefined): Module | null;
export function getModule (filter: Filter | Filter[], all = false): Module | Module[] | null {
  if (!Array.isArray(filter)) {
    filter = [ filter ];
  }
  const filterFunctionArray = filter.map(f => typeof f === 'string' ? filters.byProps(f) : f);

  const matchingModules = window.wpCache.filter(m => filterFunctionArray.every(f => f(m)));

  if (!all) {
    return matchingModules[0] || null;
  }

  return matchingModules;
}
