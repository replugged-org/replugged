import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type { ValueOf } from "type-fest";
import type { Store } from "./flux";

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

interface ShallowEqualOptions {
  shouldWarnLargeObjects?: boolean;
  logCallback?: (message: string) => void;
}

type ShallowEqual = <T>(
  a: T,
  b: T,
  excludeKeys?: string[],
  options?: ShallowEqualOptions,
) => boolean;
type AreArraysShallowEqual = <T extends []>(a: T, b: T, options?: ShallowEqualOptions) => boolean;

const shallowEqualMod = await waitForModule(
  filters.bySource(/{shouldWarnLargeObjects:\i,logCallback:\i}/),
);
const shallowEqual = getFunctionBySource<ShallowEqual>(shallowEqualMod, "Object.keys")!;
const areArraysShallowEqual = getFunctionBySource<AreArraysShallowEqual>(
  shallowEqualMod,
  ".every",
)!;

const useStateFromStoresMod = await waitForModule<Record<string, ValueOf<FluxHooks>>>(
  filters.bySource('.attach("useStateFromStores")'),
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
