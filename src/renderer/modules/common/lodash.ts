import { waitForProps } from "../webpack";

import type Lodash from "lodash";
import { FullObjectExports } from "src/types";

export default await waitForProps<"debounce", FullObjectExports & typeof Lodash>(["debounce"]);
