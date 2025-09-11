/* eslint-disable @typescript-eslint/no-explicit-any */
import type EventEmitter from "events";
import { waitForProps } from "../webpack";
import type { ActionHandler, ActionHandlerRecord } from "./flux";

export enum DispatchBand {
  Early,
  Database,
  Default,
}

interface Action {
  type: string;
  [key: string]: any;
}

type ActionMetric = [string, string, number];

export declare class ActionLogger extends EventEmitter {
  public constructor(data?: { persist: boolean });

  public persist: boolean;
  public logs: ActionLog[];

  public getLastActionMetrics: (name: string, limit?: number) => ActionMetric[];
  public getSlowestActions: (type: string, limit?: number) => ActionMetric[];
  public log: (
    action: Action,
    callback: (func: (name: string, dispatchFunc: unknown) => boolean | undefined) => void,
  ) => ActionLog;
}

interface Trace {
  name: string;
  time: number;
}

declare class ActionLog {
  public constructor(action: Action);

  public action: Action;
  public createdAt: Date;
  public id: number;
  public startTime: number;
  public totalTime: number;
  public traces: Trace[];

  public get name(): string;

  public toJSON: () => {
    actionType: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: Date;
    totalTime: number;
    traces: Trace[];
  };
}

interface NodeData {
  actionHandler: ActionHandlerRecord;
  band: DispatchBand;
  name: string;
  storeDidChange: (action: Action) => void;
}

export declare class DepGraph {
  public constructor(opts?: { circular?: boolean });

  public nodes: Record<string, { name: string }>;
  public outgoingEdges: Record<string, string[]>;
  public incomingEdges: Record<string, string[]>;
  public circular: boolean | undefined;

  public size: () => number;
  public addNode: (name: string, data?: NodeData) => void;
  public removeNode: (name: string) => void;
  public hasNode: (name: string) => boolean;
  public getNodeData: (name: string) => NodeData;
  public setNodeData: (name: string, data: NodeData) => void;
  public addDependency: (from: string, to: string) => boolean;
  public removeDependency: (from: string, to: string) => void;
  public clone: () => DepGraph;
  public dependenciesOf: (name: string, leavesOnly?: boolean) => string[];
  public dependantsOf: (name: string, leavesOnly?: boolean) => string[];
  public overallOrder: (leavesOnly?: boolean) => string[];
}

interface Handler {
  actionHandler: ActionHandler;
  name: string;
  storeDidChange: (action: Action) => void;
}

declare class ActionHandlersGraph {
  public _orderedActionHandlers: Record<string, Handler[]>;
  public _orderedCallbackTokens: string[];
  public _lastID: number;
  public _dependencyGraph: DepGraph;

  public addDependencies: (token: string, tokens: string) => void;
  public createToken: () => string;
  public getOrderedActionHandlers: (action: Action) => Handler[];
  public register: (
    name: string,
    actionHandlers: ActionHandlerRecord,
    storeDidChange: (action: Action) => void,
    band: DispatchBand,
    token?: string,
  ) => string;

  private _addToBand: (token: string, band: DispatchBand) => void;
  private _bandToken: (band: DispatchBand) => string;
  private _computeOrderedActionHandlers: (type: string) => Handler[];
  private _computeOrderedCallbackTokens: () => string[];
  private _invalidateCaches: () => void;
  private _validateDependencies: (token: string) => void;
}

interface Breadcrumb {
  category?: string;
  data?: Record<string, unknown>;
  message?: string;
}

interface SentryUtils {
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
}

export interface FluxDispatcher {
  _actionHandlers: ActionHandlersGraph;
  _currentDispatchActionType: string | null;
  _defaultBand: DispatchBand;
  _interceptors: Array<(...rest: unknown[]) => unknown>;
  _processingWaitQueue: boolean;
  _sentryUtils: SentryUtils | null | undefined;
  _subscriptions: Record<string, Set<ActionHandler>>;
  _waitQueue: Array<(...rest: unknown[]) => unknown>;
  actionLogger: ActionLogger;
  functionCache: Record<string, (action: Action) => void>;

  _dispatchWithDevtools: (action: Action) => void;
  _dispatchWithLogging: (action: Action) => void;
  _dispatch: (
    action: Action,
    func: (name: string, dispatchFunc: unknown) => boolean | undefined,
  ) => boolean | undefined;

  addDependencies: (token: string, tokens: string[]) => void;
  addInterceptor: (callback: (...rest: unknown[]) => unknown) => void;
  createToken: () => string;
  dispatch: (action: Action) => void;
  flushWaitQueue: () => void;
  isDispatching: () => boolean;
  subscribe: <A extends Action>(type: string, callback: ActionHandler<A>) => void;
  unsubscribe: <A extends Action>(type: string, callback: ActionHandler<A>) => void;
  wait: (callback: (...rest: unknown[]) => unknown) => void;
  register: (
    name: string,
    actionHandlers: ActionHandlerRecord,
    storeDidChange: (action: Action) => void,
    band: DispatchBand,
    token?: string,
  ) => string;
}

export default await waitForProps<FluxDispatcher>(
  "_currentDispatchActionType",
  "_processingWaitQueue",
);
