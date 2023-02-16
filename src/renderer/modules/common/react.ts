import { filters, waitForModule } from "../webpack";
import type React from "react";

export default await waitForModule<typeof React>(
  filters.byProps("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"),
);
