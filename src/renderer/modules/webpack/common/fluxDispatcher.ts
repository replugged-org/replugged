import { ModuleExports } from "../../../../types/discord";
import { filters, waitForModule } from "..";

type FluxCallback = (event?: { [index: string]: unknown }) => void;
export type FluxDispatcher = ModuleExports & {
  _subscriptions: { [index: string]: Set<FluxCallback> };
  dispatch: (event: { type: string; [index: string]: unknown }) => void;
  subscribe: (eventKey: string, callback: FluxCallback) => void;
  unsubscribe: (eventKey: string, callback: FluxCallback) => void;
};

export default await waitForModule<FluxDispatcher>(
  filters.byProps("_currentDispatchActionType", "_processingWaitQueue"),
);
