import type { RawModule } from "../../../types/webpack";
import { filters, waitForModule } from "../webpack";

type FluxCallback = (event?: { [index: string]: unknown }) => void;
export interface FluxDispatcher {
  _subscriptions: { [index: string]: Set<FluxCallback> };
  dispatch: (event: { type: string; [index: string]: unknown }) => void;
  subscribe: (eventKey: string, callback: FluxCallback) => void;
  unsubscribe: (eventKey: string, callback: FluxCallback) => void;
}

export default await waitForModule<RawModule & FluxDispatcher>(
  filters.byProps("_currentDispatchActionType", "_processingWaitQueue"),
);
