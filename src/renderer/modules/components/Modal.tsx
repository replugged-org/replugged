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

export interface ModalHeaderProps extends ModalCompProps {
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  className?: string;
}

export interface ModalFooterProps extends ModalHeaderProps {}

export interface ModalCloseProps {
  onClick(): void;
  withCircleBackground?: boolean;
  hideOnFullscreen?: boolean;
  className?: string;
}

export interface ModalType {
  ModalRoot: ReactComponent<ModalRootProps>;
  ModalHeader: ReactComponent<ModalHeaderProps>;
  ModalContent: ReactComponent<ModalCompProps>;
  ModalFooter: ReactComponent<ModalFooterProps>;
  ModalCloseButton: ReactComponent<ModalCloseProps>;
}

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

export default {
  ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
  ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
  ModalContent: getFunctionBySource("().content", mod as ObjectExports),
  ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
  ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
} as ModalType;
