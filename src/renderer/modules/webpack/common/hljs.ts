import type HighlightJS from "highlightjs";
import { filters, waitForModule } from "..";

const hljs: typeof HighlightJS = await waitForModule(
  filters.byProps("initHighlighting", "highlight"),
);

export default hljs;
