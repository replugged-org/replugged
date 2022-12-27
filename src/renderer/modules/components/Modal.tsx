import { ModuleExports, ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

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
export type ModalClass = Record<string, string>;
export type ModalClasses = ModuleExports & {
  Direction: ModalClass;
  Align: ModalClass;
  Justify: ModalClass;
  Wrap: ModalClass;
};
export interface ModalCompProps {
  children: React.ReactNode;
}
export interface ModalRootProps extends ModalCompProps {
  transitionState?: ModalTransitionState;
  size?: ModalSize;
  role?: "alertdialog" | "dialog";
  className?: string;
  onAnimationEnd?(): string;
}

// todo: make props type for each component
export interface ModalComponents {
  ModalRoot: (props: ModalRootProps) => React.ComponentType;
  ModalHeader: (props: ModalCompProps) => React.ComponentType;
  ModalContent: (props: ModalCompProps) => React.ComponentType;
  ModalFooter: (props: ModalCompProps) => React.ComponentType;
  ModalCloseButton: (props: ModalCompProps) => React.ComponentType;
}

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

const modal = {
  ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
  ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
  ModalContent: getFunctionBySource("().content", mod as ObjectExports),
  ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
  ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
} as ModalComponents;

export default modal;
