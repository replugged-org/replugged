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

type EqualityComparer = (a: unknown[], b: unknown[]) => boolean;

const FluxEquatorMod = await waitForModule(filters.bySource("shallowEqual: unequal key"));
const isEqualObject = getFunctionBySource<EqualityComparer>(
  FluxEquatorMod,
  "shallowEqual: unequal key",
)!;
const isEqualArray = getFunctionBySource<EqualityComparer>(FluxEquatorMod, ".some")!;

//const fluxHooksMod = await waitForProps<FluxHooks>("useStateFromStores");
const fluxHooksMod = await waitForModule<Record<string, ValueOf<FluxHooks>>>(
  filters.bySource("useStateFromStores"),
);

const useStateFromStores: FluxHooks["useStateFromStores"] = getFunctionBySource(
  fluxHooksMod,
  "useStateFromStores",
)!;

export default {
  useStateFromStores,
  statesWillNeverBeEqual: getFunctionBySource(fluxHooksMod, "return!1"),
  useStateFromStoresArray: (stores, callback, deps) =>
    useStateFromStores(stores, callback, deps, isEqualArray),
  useStateFromStoresObject: (stores, callback, deps) =>
    useStateFromStores(stores, callback, deps, isEqualObject),
} as FluxHooks;
