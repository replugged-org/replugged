import { UnknownFunction } from "src/types";
import { getExportsForProps } from "./get-modules";
import { getFunctionKeyBySource } from "./inner-search";

function byProps<P extends PropertyKey = PropertyKey>(...props: P[]) {
  return (m: Record<string, unknown>) => {
    const obj = getExportsForProps(m, props);
    if (typeof obj !== "undefined")
      for (const [k, exported] of Object.entries(m)) {
        if (exported === obj) return k;
      }
  };
}

function byString(match: string | RegExp | ((func: UnknownFunction) => boolean)) {
  return (m: Record<string, unknown>) => {
    return getFunctionKeyBySource(m, match);
  };
}

export function unmangleExports<T, M = T & { raw: unknown }>(
  mod: Record<string, unknown> | undefined,
  map: Record<
    keyof T,
    ReturnType<typeof byString> | ReturnType<typeof byString> | ((m: unknown) => string)
  >,
): M {
  const unmangled = { raw: mod } as M;
  if (!mod) return unmangled;

  for (const key in map) {
    const valueKey = map[key](mod)!;
    Object.defineProperty(unmangled, key, {
      get: () => mod[valueKey],
      set: (v) => {
        mod[valueKey] = v;
      },
    });
  }

  return unmangled;
}

unmangleExports.byString = byString;
unmangleExports.byProps = byProps;
