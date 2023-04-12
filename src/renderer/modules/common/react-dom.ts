import { waitForProps } from "../webpack";
import type ReactDOM from "react-dom";

export default (await waitForProps(["createPortal", "flushSync"])) as unknown as typeof ReactDOM;
