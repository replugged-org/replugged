import { filters, waitForModule } from "..";
import type Lodash from "lodash";

const lodash: typeof Lodash = await waitForModule(filters.byProps("debounce"));

export default lodash;
