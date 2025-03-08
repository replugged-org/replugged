import type HighlightJS from "highlight.js";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof HighlightJS>("initHighlighting", "highlight");
