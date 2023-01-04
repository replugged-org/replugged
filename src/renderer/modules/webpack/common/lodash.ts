import { filters, getExportsForProps, waitForModule } from "..";
import type Lodash from "lodash";

const lodash = getExportsForProps(await waitForModule(filters.byProps("debounce")), [
  "debounce",
]) as unknown as typeof Lodash;

export default lodash;
