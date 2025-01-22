export function start(): void {
  let $$type = window.$type;
  Object.defineProperty(window, "$type", {
    get: () => {
      return $$type;
    },
    set: (v) => {
      $$type = Function.toString.apply(v).includes("objInjections.injections.get(funcName)")
        ? (v?.prototype?.constructor ?? v)
        : v;
    },
  });
}

export function stop(): void {
  const $$type = window.$type;
  Object.defineProperty(window, "$type", {
    value: () => {
      return $$type;
    },
  });
}
