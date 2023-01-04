import { filters, waitForModule } from "..";

// @todo: type this
export default await waitForModule(
  filters.byProps("_currentDispatchActionType", "_processingWaitQueue"),
);
