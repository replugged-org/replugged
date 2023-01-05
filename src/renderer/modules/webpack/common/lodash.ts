import { filters, getExportsForProps, waitForModule } from "..";

// eslint-disable-next-line node/no-extraneous-import
import type Lodash from "lodash";

const lodash = getExportsForProps(await waitForModule(filters.byProps("debounce")), [
  "debounce",
]) as unknown as typeof Lodash;

export default lodash;
