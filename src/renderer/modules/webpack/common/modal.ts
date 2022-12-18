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

export type Modal = ModuleExports & {
  openModal: (
    render: (props: ModalProps) => React.ReactNode,
    options?: ModalOptions,
    contextKey?: string
  ) => string;
  closeModal: (modalKey: string, contextKey?: string) => void;
  ModalSize: ModalSize;
};

export type Flux = ModuleExports & {
  // todo: populate
};

type FluxCallback = (event?: { [ index: string ]: unknown }) => void;

export type FluxDispatcher = ModuleExports & {
  _subscriptions: { [ index: string ]: Set<FluxCallback>};
  dispatch: (event: { type: string, [ index: string ]: unknown }) => void;
  subscribe: (eventKey: string, callback: FluxCallback) => void;
  unsubscribe: (eventKey: string, callback: FluxCallback) => void;
};
