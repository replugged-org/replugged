import type ReactDOM from "react-dom";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof ReactDOM>("createPortal", "flushSync");
