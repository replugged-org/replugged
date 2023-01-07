import HighlightJS from "highlightjs";
import { filters, waitForModule } from "..";

export default await waitForModule<typeof HighlightJS>(
  filters.byProps("initHighlighting", "highlight"),
);
