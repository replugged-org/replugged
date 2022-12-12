import { ObjectExports } from "../../types/discord";
import { AnyFunction } from "../../types/util";

enum InjectionTypes {
  Before,
  Instead,
  After,
}

/**
 * Code to run before the original function
 * @param args Arguments passed to the original function
 * @param self The module the injected function is on
 * @returns New arguments to pass to the original function, or undefined to leave them unchanged
 */
export type BeforeCallback = (args: unknown[], self: ObjectExports) => unknown[] | undefined;

/**
 * Code to run instead of the original function
 * @param args Arguments passed to the original function
 * @param orig The original function
 * @param self The module the injected function is on
 * @returns New result to return
 */
export type InsteadCallback = (
  args: unknown[],
  orig: AnyFunction,
  self: ObjectExports,
) => unknown | undefined;

/**
 * Code to run after the original function
 * @param args Arguments passed to the original function
 * @param res Result of the original function
 * @param self The module the injected function is on
 * @returns New result to return, or undefined to leave it unchanged
 */
export type AfterCallback = (
  args: unknown[],
  res: unknown,
  self: ObjectExports,
) => unknown | undefined;

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

function replaceMethod<T extends Record<U, AnyFunction>, U extends keyof T & string>(
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

function inject<T extends Record<U, AnyFunction>, U extends keyof T & string>(
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

function before<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
  cb: BeforeCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.Before);
}

function instead<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
  cb: InsteadCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.Instead);
}

function after<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
  cb: AfterCallback,
): () => void {
  return inject(obj, funcName, cb, InjectionTypes.After);
}

export class Injector {
  private uninjectors: Set<() => void>;

  public constructor() {
    this.uninjectors = new Set();
  }

  /**
   * Run code before a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public before<T extends Record<U, AnyFunction>, U extends keyof T & string>(
    obj: T,
    funcName: U,
    cb: BeforeCallback,
  ): () => void {
    const uninjector = before(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code instead of a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public instead<T extends Record<U, AnyFunction>, U extends keyof T & string>(
    obj: T,
    funcName: U,
    cb: InsteadCallback,
  ): () => void {
    const uninjector = instead(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code after a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public after<T extends Record<U, AnyFunction>, U extends keyof T & string>(
    obj: T,
    funcName: U,
    cb: AfterCallback,
  ): () => void {
    const uninjector = after(obj, funcName, cb);
    this.uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Remove all injections made by this injector
   */
  public uninjectAll(): void {
    for (const uninjector of this.uninjectors) {
      if (typeof uninjector === "function") {
        uninjector();
        this.uninjectors.delete(uninjector);
      }
    }
  }
}
