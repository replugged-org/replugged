import HighlightJS from "highlightjs";
import { waitForProps } from "../webpack";

const props = ["initHighlighting", "highlight"];

export default await waitForProps<(typeof props)[number], typeof HighlightJS>(props);
