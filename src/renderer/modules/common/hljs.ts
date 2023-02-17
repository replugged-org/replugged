import HighlightJS from "highlightjs";
import { filters, waitForModule } from "../webpack";

export default await waitForModule<typeof HighlightJS>(
  filters.byProps("initHighlighting", "highlight"),
);
