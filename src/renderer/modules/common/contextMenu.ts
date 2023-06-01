import { filters, getFunctionBySource, waitForModule } from "../webpack";

export interface ContextMenu {
  close: () => void;
  open: (
    event: React.MouseEvent,
    render?: (props: Record<string, unknown>) => React.ReactNode,
    options?: { enableSpellCheck?: boolean },
    renderLazy?: Promise<ContextMenu>,
  ) => void;
  openLazy: (
    event: React.MouseEvent,
    renderLazy?: () => Promise<(props: Record<string, unknown>) => React.ReactNode>,
    options?: { enableSpellCheck?: boolean },
  ) => void;
}

const mod = await waitForModule(filters.bySource('type:"CONTEXT_MENU_OPEN"'));

export default {
  open: getFunctionBySource(mod, "stopPropagation")!,
  openLazy: getFunctionBySource(mod, (f) => f.toString().length < 50)!,
  close: getFunctionBySource(mod, "CONTEXT_MENU_CLOSE")!,
} as ContextMenu;
