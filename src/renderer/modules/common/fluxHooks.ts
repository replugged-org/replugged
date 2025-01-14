import { ValueOf } from "type-fest";
import type { Store } from "./flux";
import { filters, getFunctionBySource, waitForModule } from "@webpack";

export interface FluxHooks {
  useStateFromStores: <T>(
    stores: Store[],
    callback: () => T,
    deps?: React.DependencyList,
    compare?:
      | (<T extends []>(a: T, b: T) => boolean)
      | (<T extends Record<string, unknown>>(a: T, b: T) => boolean),
  ) => T;
  statesWillNeverBeEqual: <T>(a: T, b: T) => boolean;
  useStateFromStoresArray: <T>(
    stores: Store[],
    callback: () => T,
    deps?: React.DependencyList,
  ) => T;
  useStateFromStoresObject: <T>(
    stores: Store[],
    callback: () => T,
    deps?: React.DependencyList,
  ) => T;
}

type ShallowEqual = <T>(
  a: T,
  b: T,
  excludeKeys?: string[],
  callback?: (message: string) => void,
) => boolean;
type AreArraysShallowEqual = <T extends []>(a: T, b: T) => boolean;

const shallowEqualMod = await waitForModule(filters.bySource("shallowEqual: unequal key"));
const shallowEqual = getFunctionBySource<ShallowEqual>(shallowEqualMod, "shallowEqual")!;
const areArraysShallowEqual = getFunctionBySource<AreArraysShallowEqual>(shallowEqualMod, ".some")!;

const useStateFromStoresMod = await waitForModule<Record<string, ValueOf<FluxHooks>>>(
  filters.bySource("useStateFromStores"),
);

const useStateFromStores = getFunctionBySource<FluxHooks["useStateFromStores"]>(
  useStateFromStoresMod,
  "useStateFromStores",
)!;

export default {
  useStateFromStores,
  statesWillNeverBeEqual: getFunctionBySource(useStateFromStoresMod, "return!1"),
  useStateFromStoresArray: (stores, callback, deps) =>
    useStateFromStores(stores, callback, deps, areArraysShallowEqual),
  useStateFromStoresObject: (stores, callback, deps) =>
    useStateFromStores(stores, callback, deps, shallowEqual),
} as FluxHooks;
