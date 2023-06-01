import { waitForProps } from "../webpack";
import type ReactDOM from "react-dom";

export default await waitForProps<typeof ReactDOM>("createPortal", "flushSync");
