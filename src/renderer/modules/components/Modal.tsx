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

export interface ModalCloseProps {
  onClick(): void;
}

export interface ModalRootProps extends ModalCompProps {
  transitionState?: ModalTransitionState;
  size?: "small" | "medium" | "large" | "dynamic";
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

// todo: make props type for each component
export interface ModalType {
  ModalRoot: ReactComponent<ModalRootProps>;
  ModalHeader: ReactComponent<ModalCompProps>;
  ModalContent: ReactComponent<ModalCompProps>;
  ModalFooter: ReactComponent<ModalCompProps>;
  ModalCloseButton: ReactComponent<ModalCloseProps>;
}

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

export default {
  ModalRoot: getFunctionBySource(mod as ObjectExports, "().root"),
  ModalHeader: getFunctionBySource(mod as ObjectExports, "().header"),
  ModalContent: getFunctionBySource(mod as ObjectExports, "().content"),
  ModalFooter: getFunctionBySource(mod as ObjectExports, "().footerSeparator"),
  ModalCloseButton: getFunctionBySource(mod as ObjectExports, "().closeWithCircleBackground"),
} as ModalType;
