import { ObjectExports } from "../../types/discord";
import { AnyFunction, ObjectKey } from "../../types/util";

enum InjectionTypes {
  Before,
  Instead,
  After,
}

type BeforeCallback = (args: unknown[]) => unknown[] | undefined;
type InsteadCallback = (args: unknown[], orig: AnyFunction) => unknown | undefined;
type AfterCallback = (args: unknown[], res: unknown) => unknown | undefined;
type InjectionCallback = BeforeCallback | InsteadCallback | AfterCallback;

interface Injection {
  id: symbol;
  obj: ObjectExports;
  funcName: string;
  type: InjectionTypes;
  cb: InjectionCallback;
  uninject: () => void;
}

interface ObjectInjections {
  obj: ObjectExports;
  injections: Map<
    string,
    {
      before: Injection[];
      instead: Injection[];
      after: Injection[];
    }
  >;
  original: Map<string, AnyFunction>;
}

const injections = new Map<ObjectExports, ObjectInjections>();

function replaceMethod<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
): ObjectInjections {
  let objInjections: ObjectInjections;
  if (injections.has(obj)) {
    objInjections = injections.get(obj)!;
  } else {
    objInjections = {
      obj,
      injections: new Map(),
      original: new Map(),
    };
    injections.set(obj, objInjections);
  }

  if (!objInjections.injections.has(funcName)) {
    objInjections.injections.set(funcName, {
      before: [],
      instead: [],
      after: [],
    });
  }

  if (!objInjections.original.has(funcName)) {
    objInjections.original.set(funcName, obj[funcName]);

    const originalFunc = obj[funcName];

    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/48992
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

    Object.defineProperties(obj[funcName], Object.getOwnPropertyDescriptors(originalFunc));
  }

  return objInjections;
}

export function uninject(id: symbol): void {
  for (const objInjections of injections.values()) {
    for (const propInjections of objInjections.injections.values()) {
      propInjections.before = propInjections.before.filter((b) => b.id !== id);
      propInjections.instead = propInjections.instead.filter((b) => b.id !== id);
      propInjections.after = propInjections.after.filter((b) => b.id !== id);
    }
  }
}

export function before<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: BeforeCallback,
): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol("before");
  const uninjectInjection = (): void => uninject(id);
  objInjections.injections.get(funcName)?.before.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.Before,
    cb,
    uninject: uninjectInjection,
  });
  return uninjectInjection;
}

export function instead<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: InsteadCallback,
): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol("instead");
  const uninjectInjection = (): void => uninject(id);
  objInjections.injections.get(funcName)?.instead.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.Instead,
    cb,
    uninject: uninjectInjection,
  });
  return uninjectInjection;
}

export function after<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
  obj: T,
  funcName: U,
  cb: AfterCallback,
): () => void {
  const objInjections = replaceMethod(obj, funcName);
  const id = Symbol("after");
  const uninjectInjection = (): void => uninject(id);
  objInjections.injections.get(funcName)?.after.push({
    id,
    obj,
    funcName,
    type: InjectionTypes.After,
    cb,
    uninject: uninjectInjection,
  });
  return uninjectInjection;
}

export class MiniInjector {
  private uninjectors: Array<() => void>;

  public constructor() {
    this.uninjectors = [];
  }

  public before<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: BeforeCallback,
  ): () => void {
    const uninjector = before(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  public instead<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: BeforeCallback,
  ): () => void {
    const uninjector = instead(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  public after<T extends Record<U, AnyFunction>, U extends ObjectKey<T, AnyFunction>>(
    obj: T,
    funcName: U,
    cb: BeforeCallback,
  ): () => void {
    const uninjector = after(obj, funcName, cb);
    this.uninjectors.push(uninjector);
    return uninjector;
  }

  // TODO(lleyton): Determine if this is public or private
  public uninjectAll(): void {
    for (const uninjector of this.uninjectors) {
      if (typeof uninjector === "function") {
        uninjector();
      }
    }
    this.uninjectors = [];
  }
}
