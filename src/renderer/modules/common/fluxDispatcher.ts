import { waitForProps } from "../webpack";

type FluxCallback = (event?: { [index: string]: unknown }) => void;

export interface Event {
  type: string;
  [index: string]: unknown;
}

export interface FluxDispatcher {
  _currentDispatchActionType: string | null;
  _defaultBand: number;
  _interceptors: Array<(...reset: unknown[]) => unknown>;
  _processingWaitQueue: boolean;
  _subscriptions: { [index: string]: Set<FluxCallback> };
  _waitQueue: Array<(...reset: unknown[]) => unknown>;
  _dispatchWithDevtools: (event: Event) => void;
  _dispatchWithLogging: (event: Event) => void;

  addInterceptor: (callback: (...rest: unknown[]) => unknown) => void;
  createToken: () => string;
  dispatch: (event: Event) => void;
  flushWaitQueue: () => void;
  isDispatching: () => boolean;
  subscribe: (eventKey: string, callback: FluxCallback) => void;
  unsubscribe: (eventKey: string, callback: FluxCallback) => void;
  wait: (callback: (...rest: unknown[]) => unknown) => void;
}

export default await waitForProps<FluxDispatcher>(
  "_currentDispatchActionType",
  "_processingWaitQueue",
);
