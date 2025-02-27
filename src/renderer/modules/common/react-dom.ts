import type ReactDOM from "react-dom";
import { waitForProps } from "../webpack";

export default waitForProps<typeof ReactDOM>("createPortal", "flushSync");
