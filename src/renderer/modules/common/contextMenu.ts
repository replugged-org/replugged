import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface ImpressionProperties {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  guild_id?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  channel_id?: string;
}

interface ContextMenusOptions {
  align?: "top" | "bottom" | "left" | "right" | "center";
  position?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  onClose?: () => void;
  impressionName?: string;
  impressionProperties?: ImpressionProperties;
  enableSpellCheck?: boolean;
}

interface ContextMenuProps {
  className: string;
  position: "top" | "bottom" | "left" | "right" | "center" | "window_center" | null;
  theme: string;
  onHeightUpdate: () => void;
  config: ContextMenusOptions;
  target: HTMLElement;
  context: string;
}

export interface ContextMenu {
  close: () => void;
  open: (
    event: React.MouseEvent,
    render?: (props: ContextMenuProps) => React.ReactNode,
    options?: ContextMenusOptions,
    renderLazy?: Promise<(props: ContextMenuProps) => React.ReactNode>,
  ) => void;
  openLazy: (
    event: React.MouseEvent,
    renderLazy?: () => Promise<(props: ContextMenuProps) => React.ReactNode>,
    options?: ContextMenusOptions,
  ) => void;
}

const getContextMenu = async (): Promise<ContextMenu> => {
  const mod = await waitForModule(filters.bySource('type:"CONTEXT_MENU_OPEN"'));
  return {
    open: getFunctionBySource(mod, "stopPropagation")!,
    openLazy: getFunctionBySource(mod, (f) => f.toString().length < 50)!,
    close: getFunctionBySource(mod, "CONTEXT_MENU_CLOSE")!,
  };
};

export default getContextMenu();
