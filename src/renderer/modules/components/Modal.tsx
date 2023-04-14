import type React from "react";
import type { ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
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
  ModalRoot: getFunctionBySource(mod, "().root"),
  ModalHeader: getFunctionBySource(mod, "().header"),
  ModalContent: getFunctionBySource(mod, "().content"),
  ModalFooter: getFunctionBySource(mod, "().footerSeparator"),
  ModalCloseButton: getFunctionBySource(mod, "().closeWithCircleBackground"),
} as ModalType;
