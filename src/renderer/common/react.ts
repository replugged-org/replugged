import { filters, waitForModule } from "../modules/webpack";

export default await waitForModule(
  filters.byProps("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"),
);
