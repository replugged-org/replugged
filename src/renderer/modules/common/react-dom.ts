import { waitForProps } from "../webpack";
import type ReactDOM from "react-dom";

const props = ["createPortal", "flushSync"];

export default await waitForProps<(typeof props)[number], typeof ReactDOM>(props);
