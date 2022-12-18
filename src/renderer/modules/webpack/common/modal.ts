export type Modal = ModuleExports & {
  openModal: (
    render: (props: ModalProps) => React.ReactNode,
    options?: ModalOptions,
    contextKey?: string
  ) => string;
  closeModal: (modalKey: string, contextKey?: string) => void;
  ModalSize: ModalSize;
};
