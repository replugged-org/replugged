import type HighlightJS from "highlightjs";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof HighlightJS>("initHighlighting", "highlight");
