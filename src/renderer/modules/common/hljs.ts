import HighlightJS from "highlightjs";
import { waitForProps } from "../webpack";

export default (await waitForProps([
  "initHighlighting",
  "highlight",
])) as unknown as typeof HighlightJS;
