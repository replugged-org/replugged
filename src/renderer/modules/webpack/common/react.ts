import { filters, waitForModule } from "..";
import type React from "react";

const react: typeof React = await waitForModule(
  filters.byProps("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"),
);

export default react;
