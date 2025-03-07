import type HighlightJS from "highlight.js";
import { waitForProps } from "../webpack";

export default waitForProps<typeof HighlightJS>("initHighlighting", "highlight");
