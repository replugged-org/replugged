import type { ObjectExports, RawModule } from "../../../../types/webpack";
import type { ReactComponent } from "../../../../types/util";
import { filters, getBySource, getFunctionBySource, waitForModule } from "..";

enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
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

export interface ModalClasses {
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
}

export interface ModalRootProps {
  transitionState?: ModalTransitionState;
  size?: "small" | "medium" | "large" | "dynamic";
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

export interface Modal {
  openModal: (
    render: (props: ModalProps) => React.ReactNode,
    options?: ModalOptions,
    contextKey?: string,
  ) => string;
  closeModal: (modalKey: string, contextKey?: string) => void;
  ModalSize: "small" | "medium" | "large" | "dynamic";
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
}

const mod = await waitForModule(filters.bySource("onCloseRequest:null!="));

const classes = getBySource<RawModule & ModalClasses>("().justifyStart")!;

export default {
  openModal: getFunctionBySource<Modal["openModal"]>(
    "onCloseRequest:null!=",
    mod as ObjectExports,
  )!,
  closeModal: getFunctionBySource<Modal["closeModal"]>("onCloseCallback&&", mod as ObjectExports)!,
  Direction: classes?.Direction,
  Align: classes?.Align,
  Justify: classes?.Justify,
  Wrap: classes?.Wrap,
} as Modal;
