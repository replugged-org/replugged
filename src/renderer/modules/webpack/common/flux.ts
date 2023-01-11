/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RawModule, ReactComponent } from "../../../../types";
import type { FluxDispatcher as Dispatcher } from "./fluxDispatcher";
import { filters, waitForModule } from "..";

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

  public batched(): void;
  public destroy(): void;

  public emit(): void;
  public emitReactOnce(): void;
  public emitNonReactOnce(): void;

  public getChangeSentinel(): number;
  public getIsPaused(): boolean;

  public injectBatchEmitChanges(): void;
  public markChanged(): void;

  public pause(callback?: () => void): void;
  public resume(callback?: () => void): void;
}

type Callback = () => void;

interface Callbacks {
  listeners: Set<Callback>;
  add(callback: Callback): void;
  addConditional(callback: Callback, condition: boolean): void;
  remove(callback: Callback): void;
  has(callback: Callback): boolean;
  hasAny(): boolean;
  invokeAll(): void;
}

export declare class Store {
  public constructor(dispatcher: Dispatcher, actions: ActionHandlerRecord);

  public static destroy(): void;
  public static getAll(): Store[];
  public static initialize(): void;
  public static initialized: Promise<boolean | undefined>;

  public _isInitialized: boolean;
  public _dispatchToken: DispatchToken;
  public _dispatcher: Dispatcher;
  public _changeCallbacks: Callbacks;
  public _reactChangeCallbacks: Callbacks;

  public initialize(): void;
  public initializeIfNeeded(): void;
  public getDispatchToken(): DispatchToken;
  public getName(): string;

  public emitChange(): void;
  public mustEmitChanges(func?: () => boolean): void;
  public syncWith(stores: Store[], func: () => boolean, timeout?: number): void;
  public waitFor(...stores: Store[]): void;

  public addChangeListener(listener: Callback): void;
  public addConditionalChangeListener(listener: Callback, condition: boolean): void;
  public addReactChangeListener(listener: Callback): void;
  public removeChangeListener(listener: Callback): void;
  public removeReactChangeListener(listener: Callback): void;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public __getLocalVars(): Record<string, unknown>;
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

export interface Flux {
  DeviceSettingsStore: DeviceSettingsStore;
  Emitter: Emitter;
  OfflineCacheStore: OfflineCacheStore;
  PersistedStore: typeof PersistedStore;
  Store: typeof Store;
  connectStores<OuterProps, InnerProps>(
    stores: Store[],
    callback: (props: OuterProps) => InnerProps,
    options?: { forwardRef: boolean },
  ): (component: ReactComponent<InnerProps & OuterProps>) => React.ReactElement<OuterProps>;

  destroy(): void;
  initialize(): void;
  get initialized(): Promise<boolean | undefined>;
}

export default await waitForModule<RawModule & Flux>(filters.byProps("Store", "connectStores"));
