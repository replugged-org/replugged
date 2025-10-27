import { filters, getFunctionBySource, waitForModule } from "../webpack";

type Equal<T> = (a: T, b: T) => boolean;

interface ZustandStore<T> {
  useState: <U>(selector: (state: T) => U, equal?: Equal<U>) => U;
  getState: <U = T>(selector?: (state: T) => U) => U;
  useField: <K extends keyof T>(key: K, equal?: Equal<T[K]>) => T[K];
  getField: <K extends keyof T>(key: K) => T[K];
  subscribe: <U>(
    listener: (value: U, prev: U) => void,
    selector?: (state: T) => U,
    equal?: Equal<U>,
  ) => () => void;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  resetState: () => void;
}

export type CreateZustandStore = <T = unknown>(defaultValue: () => T) => ZustandStore<T>;

const key = /useField:\i,getField:\i/;

const mod = await waitForModule(filters.bySource(key));

export default getFunctionBySource<CreateZustandStore>(mod, key)!;
