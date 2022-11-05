import { ObjectExports } from "../../types/discord";
import { AnyFunction, ObjectKey } from "../../types/util";

enum InjectionTypes {
  Before,
  Instead,
  After,
}

type BeforeCallback = (args: unknown[], self: ObjectExports) => unknown[] | undefined;
type InsteadCallback = (
  args: unknown[],
  orig: AnyFunction,
  self: ObjectExports,
) => unknown | undefined;
type AfterCallback = (args: unknown[], res: unknown, self: ObjectExports) => unknown | undefined;

interface ObjectInjections {
  injections: Map<
    string,
    {
      before: Set<BeforeCallback>;
      instead: Set<InsteadCallback>;
      after: Set<AfterCallback>;
    }
  >;
  original: Map<string, AnyFunction>;
}

const injections = new WeakMap<ObjectExports, ObjectInjections>();

function replaceMethod<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
): void {
  if (typeof obj[funcName] !== "function") {
    throw new Error(`Value of '${funcName}' in object is not a function`);
  }

  let objInjections: ObjectInjections;
  if (injections.has(obj)) {
    objInjections = injections.get(obj)!;
  } else {
    objInjections = {
      injections: new Map(),
      original: new Map(),
    };
    injections.set(obj, objInjections);
  }

  if (!objInjections.injections.has(funcName)) {
    objInjections.injections.set(funcName, {
      before: new Set(),
      instead: new Set(),
      after: new Set(),
    });
  }

  if (!objInjections.original.has(funcName)) {
    objInjections.original.set(funcName, obj[funcName]);

    const originalFunc = obj[funcName];

    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/48992
    obj[funcName] = function (...args: unknown[]): unknown {
      const injectionsForProp = objInjections.injections.get(funcName)!;

      for (const b of injectionsForProp.before) {
        const newArgs = b(args, this);
        if (Array.isArray(newArgs)) {
          args = newArgs;
        }
      }

      let res: unknown;

      if (injectionsForProp.instead.size === 0) {
        res = originalFunc.apply(this, args);
      } else {
        for (const i of injectionsForProp.instead) {
          const newResult = i(args, originalFunc, this);
          if (newResult !== void 0) {
            res = newResult;
          }
        }
      }

      for (const a of injectionsForProp.after) {
        const newResult = a(args, res, this);
        if (newResult !== void 0) {
          res = newResult;
        }
      }

      return res;
    };

    Object.defineProperties(obj[funcName], Object.getOwnPropertyDescriptors(originalFunc));
  }
}

function inject<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: BeforeCallback | InsteadCallback | AfterCallback,
  type: InjectionTypes,
): () => void {
  replaceMethod(obj, funcName);
  const methodInjections = injections.get(obj)!.injections.get(funcName)!;
  let set: Set<BeforeCallback | InsteadCallback | AfterCallback>;
  switch (type) {
    case InjectionTypes.Before:
      set = methodInjections.before;
      break;
    case InjectionTypes.Instead:
      set = methodInjections.instead;
      break;
    case InjectionTypes.After:
      set = methodInjections.after;
      break;
    default:
      throw new Error(`Invalid injection type: ${type}`);
  }
  set.add(cb);
  return () => void set.delete(cb);
}

export function before<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: BeforeCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.Before);
}

export function instead<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: InsteadCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.Instead);
}

export function after<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: AfterCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.After);
}

export class MiniInjector {
  private uninjectors: Set<() => void>;

  public constructor() {
    this.uninjectors = new Set();
  }

  public before<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: BeforeCallback,
  ): () => void {
    const uninjector = before(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  public instead<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: InsteadCallback,
  ): () => void {
    const uninjector = instead(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  public after<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: AfterCallback,
  ): () => void {
    const uninjector = after(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  public uninjectAll(): void {
    for (const uninjector of this.uninjectors) {
      if (typeof uninjector === "function") {
        uninjector();
        this.uninjectors.delete(uninjector);
      }
    }
  }
}
