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
  open: getFunctionBySource(mod as ObjectExports, "stopPropagation"),
  openLazy: getFunctionBySource(mod as ObjectExports, (f) => f.toString().length < 50),
  close: getFunctionBySource(mod as ObjectExports, "CONTEXT_MENU_CLOSE"),
} as ContextMenu;
