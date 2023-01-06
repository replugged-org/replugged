import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

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
export interface ModalCompProps {
  children: React.ReactNode;
}
export interface ModalRootProps extends ModalCompProps {
  transitionState?: ModalTransitionState;
  size?: "small" | "medium" | "large" | "dynamic";
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

// todo: make props type for each component
export type ModalType = {
  ModalRoot: ReactComponent<ModalRootProps>;
  ModalHeader: ReactComponent<ModalCompProps>;
  ModalContent: ReactComponent<ModalCompProps>;
  ModalFooter: ReactComponent<ModalCompProps>;
  ModalCloseButton: ReactComponent<ModalCompProps>;
};

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

export default {
  ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
  ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
  ModalContent: getFunctionBySource("().content", mod as ObjectExports),
  ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
  ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
} as ModalType;
