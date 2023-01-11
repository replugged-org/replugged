import { filters, getExportsForProps, waitForModule } from "..";

import type Lodash from "lodash";

export default getExportsForProps(await waitForModule(filters.byProps("debounce")), [
  "debounce",
]) as unknown as typeof Lodash;
