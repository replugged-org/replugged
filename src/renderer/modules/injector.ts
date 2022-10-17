import { ModuleExports } from '../../types/discord';

enum InjectionTypes {
  Before,
  Instead,
  After
}

type BeforeCallback = (args: unknown[]) => unknown[] | undefined;
type InsteadCallback = (args: unknown[], orig: (...args: unknown[]) => unknown) => unknown | undefined;
type AfterCallback = (args: unknown[], res: unknown) => unknown | undefined;
type InjectionCallback = BeforeCallback | InsteadCallback | AfterCallback;

interface Injection {
  id: symbol;
  obj: ModuleExports;
  funcName: string;
  type: InjectionTypes;
  cb: InjectionCallback;
  uninject: () => void;
}

interface ObjectInjections {
  obj: ModuleExports;
  injections: Map<string, {
    before: Injection[];
    instead: Injection[];
    after: Injection[];
  }>;
  original: Map<string, (...args: unknown[]) => unknown>;
}

const injections = new Map<ModuleExports, ObjectInjections>();

function replaceMethod (obj: ModuleExports, funcName: string): ObjectInjections {
  let objInjections: ObjectInjections;
  if (injections.has(obj)) {
    objInjections = injections.get(obj) as ObjectInjections;
  } else {
    objInjections = {
      obj,
      injections: new Map(),
      original: new Map()
    };
    injections.set(obj, objInjections);
  }

  if (!(objInjections.injections.has(funcName))) {
    objInjections.injections.set(funcName, {
      before: [],
      instead: [],
      after: []
    });
  }

  if (!(objInjections.original.has(funcName))) {
    objInjections.original.set(funcName, obj[funcName]);

    const originalFunc = obj[funcName];

    obj[funcName] = function (...args: unknown[]): unknown {
      const injectionsForProp = objInjections.injections.get(funcName) as {
        before: Injection[];
        instead: Injection[];
        after: Injection[];
      };

      for (const b of injectionsForProp.before) {
        const newArgs = (b.cb as BeforeCallback)(args);
        if (Array.isArray(newArgs)) {
          args = newArgs;
        }
      }

      let res: unknown;

      if (injectionsForProp.instead.length === 0) {
        res = originalFunc.apply(obj, args);
      } else {
        for (const i of injectionsForProp.instead) {
          const newResult = (i.cb as InsteadCallback)(args, originalFunc);
          if (newResult !== void 0) {
            res = newResult;
          }
        }
      }

      for (const a of injectionsForProp.after) {
        const newResult = (a.cb as AfterCallback)(args, res);
        if (newResult !== void 0) {
          res = newResult;
        }
      }

      return res;
    };

    Object.defineProperties(
      obj[funcName],
      Object.getOwnPropertyDescriptors(originalFunc)
    );
  }

  return objInjections;
}

export function uninject (id: symbol): void {
  for (const objInjections of injections.values()) {
    for (const propInjections of objInjections.injections.values()) {
      propInjections.before = propInjections.before.filter(b => b.id !== id);
      propInjections.instead = propInjections.instead.filter(b => b.id !== id);
      propInjections.after = propInjections.after.filter(b => b.id !== id);
    }
  }
}

export function before (obj: ModuleExports, funcName: string, cb: BeforeCallback): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol('before');
  const uninjectInjection = () => uninject(id);
  objInjections.injections.get(funcName)?.before.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.Before,
    cb,
    uninject: uninjectInjection
  });
  return uninjectInjection;
}

export function instead (obj: ModuleExports, funcName: string, cb: InsteadCallback): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol('instead');
  const uninjectInjection = () => uninject(id);
  objInjections.injections.get(funcName)?.instead.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.Instead,
    cb,
    uninject: uninjectInjection
  });
  return uninjectInjection;
}

export function after (obj: ModuleExports, funcName: string, cb: AfterCallback): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol('after');
  const uninjectInjection = () => uninject(id);
  objInjections.injections.get(funcName)?.after.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.After,
    cb,
    uninject: uninjectInjection
  });
  return uninjectInjection;
}

export class MiniInjector {
  uninjectors: (() => void)[];

  constructor () {
    this.uninjectors = [];
  }

  before (obj: ModuleExports, funcName: string, cb: BeforeCallback): () => void {
    const uninjector = before(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  instead (obj: ModuleExports, funcName: string, cb: BeforeCallback): () => void {
    const uninjector = instead(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  after (obj: ModuleExports, funcName: string, cb: BeforeCallback): () => void {
    const uninjector = after(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  uninjectAll () {
    for (const uninjector of this.uninjectors) {
      if (typeof uninjector === 'function') {
        uninjector();
      }
    }
    this.uninjectors = [];
  }
}
