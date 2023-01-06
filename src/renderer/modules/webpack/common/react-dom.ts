import { filters, waitForModule } from "..";
import type ReactDOM from "react-dom";

export default await waitForModule<typeof ReactDOM>(filters.byProps("createPortal", "flushSync"));
