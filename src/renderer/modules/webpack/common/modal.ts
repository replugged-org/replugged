import { ModuleExports, ObjectExports } from "../../../../types/discord";
import { ReactComponent } from "../../../../types/util";
import { filters, getBySource, getFunctionBySource, waitForModule } from "..";

enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
}

export enum ModalSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  DYNAMIC = "dynamic",
}

export interface ModalProps {
  transitionState: ModalTransitionState;
  onClose(): Promise<void>;
}

export interface ModalOptions {
  modalKey?: string;
  onCloseRequest?: () => void;
  onCloseCallback?: () => void;
}

export type ModalClasses = ModuleExports & {
  Direction: Record<string, string>;
  Align: Record<string, string>;
  Justify: Record<string, string>;
  Wrap: Record<string, string>;
};

export interface ModalRootProps {
  transitionState?: ModalTransitionState;
  size?: ModalSize;
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

// todo: make props type for each component
export interface ModalComponents {
  ModalRoot: ReactComponent<ModalRootProps>;
  ModalHeader: ReactComponent<unknown>;
  ModalContent: ReactComponent<unknown>;
  ModalFooter: ReactComponent<unknown>;
  ModalCloseButton: ReactComponent<unknown>;
}

export type Modal = ModuleExports & {
  openModal: (
    render: (props: ModalProps) => React.ReactNode,
    options?: ModalOptions,
    contextKey?: string,
  ) => string;
  closeModal: (modalKey: string, contextKey?: string) => void;
  ModalSize: ModalSize;
  Direction: string;
  Align: string;
  Justify: string;
  Wrap: string;
};

const mod = await waitForModule(filters.bySource("onCloseRequest:null!="));

const classes = getBySource("().justifyStart")! as ModalClasses;

const modal = {
  openModal: getFunctionBySource("onCloseRequest:null!=", mod as ObjectExports),
  closeModal: getFunctionBySource("onCloseCallback&&", mod as ObjectExports),
  ModalSize,
  Direction: classes?.Direction,
  Align: classes?.Align,
  Justify: classes?.Justify,
  Wrap: classes?.Wrap,
} as unknown as Modal;

export default modal;
