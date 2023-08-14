/* eslint-disable @typescript-eslint/no-explicit-any */
import { filters, getFunctionBySource, waitForModule, waitForProps } from "../webpack";
import type { DispatchBand, FluxDispatcher as Dispatcher } from "./fluxDispatcher";

type DispatchToken = string;
type ActionType = string;

interface Action {
  type: ActionType;
}

type ActionHandler<A extends Action = any> = (action: A) => void;

type ActionHandlerRecord = {
  [A in ActionType]: ActionHandler<{ type: A; [key: string]: any }>;
};

export declare class Emitter {
  public static changeSentinel: number;
  public static changedStores: Set<Store>;
  public static isBatchEmitting: boolean;
  public static isDispatching: boolean;
  public static isPaused: boolean;
  public static pauseTimer: ReturnType<typeof setTimeout> | undefined;
  public static reactChangedStores: Set<Store>;

  public batched(func: () => void): void;
  public destroy(): void;

  public emit(): void;
  public emitReactOnce(): void;
  public emitNonReactOnce(): void;

  public getChangeSentinel(): number;
  public getIsPaused(): boolean;

  public injectBatchEmitChanges(func: () => void): void;
  public markChanged(store: Store): void;

  public pause(timeout?: number): void;
  public resume(shouldEmit?: boolean): void;
}

type Callback = () => void;

declare class Callbacks {
  public listeners: Set<Callback>;
  public add(listener: Callback): void;
  public remove(listener: Callback): void;
  public addConditional(listener: Callback, condition: boolean): void;

  public has(listener: Callback): boolean;
  public hasAny(): boolean;
  public invokeAll(): void;
}

export declare class Store {
  public constructor(dispatcher: Dispatcher, actions?: ActionHandlerRecord, band?: DispatchBand);

  public static destroy(): void;
  public static getAll(): Store[];
  public static initialize(): void;
  public static initialized: Promise<boolean | undefined>;

  public _isInitialized: boolean;
  public _dispatchToken: DispatchToken;
  public _dispatcher: Dispatcher;
  public _changeCallbacks: Callbacks;
  public _reactChangeCallbacks: Callbacks;
  public _mustEmitChanges: Parameters<Store["mustEmitChanges"]>[0];

  public initialize(): void;
  public initializeIfNeeded(): void;
  public getDispatchToken(): DispatchToken;
  public getName(): string;

  public emitChange(): void;
  public mustEmitChanges(func?: (action?: Action) => boolean): void;
  public syncWith(stores: Store[], func: () => boolean, timeout?: number): void;
  public waitFor(...stores: Store[]): void;

  public addChangeListener(listener: Callback): void;
  public addConditionalChangeListener(listener: Callback, condition: boolean): void;
  public addReactChangeListener(listener: Callback): void;
  public removeChangeListener(listener: Callback): void;
  public removeReactChangeListener(listener: Callback): void;

  public registerActionHandlers(actions: ActionHandlerRecord, band?: DispatchBand): void;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public __getLocalVars?(): Record<string, unknown>;
}

interface ClearOptions {
  omit?: string[];
  type: "all" | "user-data-only";
}

interface State {
  [key: string]: any;
}

type States = Record<string, State>;
type Migration = () => void;

export declare class PersistedStore extends Store {
  public static allPersistKeys: Set<string>;

  public static clearAll(options: ClearOptions): Promise<void>;
  public static clearPersistQueue(options: ClearOptions): void;
  public static destroy(): void;

  public static disableWrite: boolean;
  public static disableWrites: boolean;

  public static getAllStates(): States;
  public static initializeAll(states: States): void;
  public static migrateAndReadStoreState(
    persistKey: string,
    migrations: Migration[] | undefined,
  ): {
    state: State;
    requiresPersist: boolean;
  };
  public static shouldClear(options: ClearOptions, persistKey: string): boolean;

  public static throttleDelay: number;
  public static userAgnosticPersistKeys: Set<string>;

  public static _writePromises: Map<string, any>;
  public static _writeResolvers: Map<string, any>;

  public asyncPersist(): Promise<void>;
  public clear(): void;
  public getClass(): any;
  public initializeFromState(state: any): void;
  public initializeIfNeeded(): void;
  public persist(): void;
}

export type DeviceSettingsStore = typeof PersistedStore;
export type OfflineCacheStore = typeof PersistedStore;

export interface FluxMod {
  DeviceSettingsStore: DeviceSettingsStore;
  Emitter: Emitter;
  OfflineCacheStore: OfflineCacheStore;
  PersistedStore: typeof PersistedStore;
  Store: typeof Store;
  connectStores<OuterProps, InnerProps>(
    stores: Store[],
    callback: (props: OuterProps) => InnerProps,
    options?: { forwardRef: boolean },
  ): (component: React.ComponentType<InnerProps & OuterProps>) => React.ComponentClass<OuterProps>;

  destroy(): void;
  initialize(): void;
  get initialized(): Promise<boolean | undefined>;
}

const FluxMod = await waitForProps<FluxMod>("Store", "connectStores");

interface Snapshot<Data> {
  data: Data;
  version: number;
}

export declare class SnapshotStore<Data = Record<string, unknown>> extends Store {
  public static allStores: SnapshotStore[];

  public static clearAll: () => void;

  public get persistKey(): string;

  public clear: () => void;
  public getClass: () => any;
  public readSnapshot: (version: number) => Snapshot<Data>["data"] | null;
  public registerActionHandlers: (actions: ActionHandlerRecord) => void;
  public save: () => void;
}

const SnapshotStoreClass = await waitForModule<typeof SnapshotStore>(
  filters.bySource("SnapshotStores"),
);

type useStateFromStores = <T>(
  stores: Store[],
  callback: () => T,
  deps?: React.DependencyList,
  compare?:
    | (<T extends []>(a: T, b: T) => boolean)
    | (<T extends Record<string, unknown>>(a: T, b: T) => boolean),
) => T;
type statesWillNeverBeEqual = <T>(a: T, b: T) => boolean;
type useStateFromStoresArray = <T>(
  stores: Store[],
  callback: () => T,
  deps?: React.DependencyList,
) => T;
type useStateFromStoresObject = <T>(
  stores: Store[],
  callback: () => T,
  deps?: React.DependencyList,
) => T;

const FluxHooksMod = await waitForModule(filters.bySource("useStateFromStores"));

const useStateFromStores = getFunctionBySource<useStateFromStores>(
  FluxHooksMod,
  "useStateFromStores",
)!;
const statesWillNeverBeEqual = getFunctionBySource<statesWillNeverBeEqual>(
  FluxHooksMod,
  "return!1",
)!;
const useStateFromStoresArray: useStateFromStoresArray = (stores, callback, deps) =>
  useStateFromStores(stores, callback, deps, _.isEqual);
const useStateFromStoresObject: useStateFromStoresObject = (stores, callback, deps) =>
  useStateFromStores(stores, callback, deps, _.isEqual);

const FluxHooks = {
  useStateFromStores,
  statesWillNeverBeEqual,
  useStateFromStoresArray,
  useStateFromStoresObject,
};

export type Flux = FluxMod & { SnapshotStore: typeof SnapshotStore } & typeof FluxHooks;

export default { ...FluxMod, SnapshotStore: SnapshotStoreClass, ...FluxHooks } as Flux;
