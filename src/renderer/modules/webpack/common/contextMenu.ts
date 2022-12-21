import { ModuleExports, ObjectExports } from "../../../../types";
import { filters, getFunctionBySource, waitForModule } from "..";

export type ContextMenu = ModuleExports & {
  close: () => void;
  open: (
    event: React.UIEvent,
    render?: ContextMenu,
    options?: { enableSpellsheck?: boolean },
    renderLazy?: Promise<ContextMenu>
  ) => void;
  openLazy: (
    event: React.UIEvent,
    renderLazy?: Promise<ContextMenu>,
    options?: { enableSpellsheck?: boolean },
  ) => void;
};

const mod = await waitForModule(filters.bySource('type:"CONTEXT_MENU_OPEN"'))

const contextMenu = {
  open: getFunctionBySource("stopPropagation", mod as ObjectExports),
  openLazy: getFunctionBySource((f) => f.toString().length < 50, mod as ObjectExports),
  close: getFunctionBySource("CONTEXT_MENU_CLOSE", mod as ObjectExports),
} as ContextMenu;

export default contextMenu;
