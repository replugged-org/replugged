import { waitForProps } from "../webpack";
import type React from "react";

export default (await waitForProps([
  "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
  "createElement",
])) as unknown as typeof React;
