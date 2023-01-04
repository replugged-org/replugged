import type { ModuleExports, ObjectExports } from "../../../types";
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
export type ModalClasses = ModuleExports & {
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
};
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
  ModalRoot: (props: ModalRootProps) => React.ComponentType;
  ModalHeader: (props: ModalCompProps) => React.ComponentType;
  ModalContent: (props: ModalCompProps) => React.ComponentType;
  ModalFooter: (props: ModalCompProps) => React.ComponentType;
  ModalCloseButton: (props: ModalCompProps) => React.ComponentType;
};

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

const modal = {
  ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
  ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
  ModalContent: getFunctionBySource("().content", mod as ObjectExports),
  ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
  ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
} as ModalType;

export default modal;
