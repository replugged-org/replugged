import { waitForProps } from "../webpack";

import type Lodash from "lodash";
import { ObjectExports } from "src/types";

export default await waitForProps<"debounce", ObjectExports & typeof Lodash>(["debounce"]);
