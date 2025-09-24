export function unmangleExports<T = Record<string, unknown>, M = T & { symbol: unknown }>(
  mod: Record<string, unknown> | undefined,
  map: Record<keyof T, string>,
): M {
  const unmangled = { [Symbol.for("raw")]: mod } as M;
  if (!mod) return unmangled;

  for (const string in map) {
    const key = map[string];
    Object.defineProperty(unmangled, string, {
      configurable: true,
      enumerable: true,
      get() {
        const val = mod[key];
        return typeof val === "function" ? val.bind(mod) : val;
      },
      set(newValue) {
        mod[key] = newValue;
      },
    });
  }

  return unmangled;
}
