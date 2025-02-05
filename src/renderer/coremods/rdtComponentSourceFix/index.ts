import { AnyFunction } from "src/types";

function getOriginal(fn?: AnyFunction): AnyFunction | undefined {
  return typeof fn === "function" &&
    Function.toString.apply(fn).includes("objInjections.injections.get(funcName)")
    ? (fn.prototype?.constructor ?? fn)
    : fn;
}

export function start(): void {
  let $$type = getOriginal(window.$type);
  Object.defineProperty(window, "$type", {
    get: () => {
      return $$type;
    },
    set: (v) => {
      $$type = getOriginal(v);
    },
    configurable: true,
    enumerable: true,
  });
}

export function stop(): void {
  delete window.$type;
}
