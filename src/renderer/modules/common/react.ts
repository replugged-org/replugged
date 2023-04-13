import { waitForProps } from "../webpack";
import type React from "react";

const props = ["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"];

export default await waitForProps<(typeof props)[number], typeof React>(props);
