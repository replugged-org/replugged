import type { ObjectExports } from "../../../../types";
import { filters, getFunctionBySource, waitForModule } from "..";

export interface ContextMenu {
  close: () => void;
  open: (
    event: React.UIEvent,
    render?: ContextMenu,
    options?: { enableSpellCheck?: boolean },
    renderLazy?: Promise<ContextMenu>,
  ) => void;
  openLazy: (
    event: React.UIEvent,
    renderLazy?: Promise<ContextMenu>,
    options?: { enableSpellCheck?: boolean },
  ) => void;
}

const mod = await waitForModule(filters.bySource('type:"CONTEXT_MENU_OPEN"'));

export default {
  open: getFunctionBySource("stopPropagation", mod as ObjectExports),
  openLazy: getFunctionBySource((f) => f.toString().length < 50, mod as ObjectExports),
  close: getFunctionBySource("CONTEXT_MENU_CLOSE", mod as ObjectExports),
} as ContextMenu;
