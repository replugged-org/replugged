import { waitForProps } from "../webpack";

import type Lodash from "lodash";

export default (await waitForProps(["debounce"])) as unknown as typeof Lodash;
