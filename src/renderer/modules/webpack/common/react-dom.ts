import { filters, waitForModule } from "..";
import type ReactDOM from "react-dom";

const reactDom: typeof ReactDOM = await waitForModule(filters.byProps("createPortal", "flushSync"));

export default reactDom;
