import { ModuleExports } from './discord';

export type ReactComponent<P> = React.ComponentType<React.PropsWithChildren<P & Record<string, unknown>>>

export type SwitchItem = ReactComponent<{
  note?: string;
  value: boolean;
  onChange: () => void;
}>;

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
}

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

export interface Menu {
  ContextMenu: ReactComponent<{
    navId: string,
    onClose?: () => void,
    className?: string,
    style?: React.CSSProperties,
    hideScroller?: boolean,
    onSelect?: () => void,
  }>;
  
  MenuSeparator: React.ComponentType;
  
  MenuGroup: ReactComponent<unknown>;
  
  MenuItem: ReactComponent<{
    id: string;
    label: string;
    render?: React.ComponentType;
    onChildrenScroll?: () => void;
    childRowHeight?: number;
    listClassName?: string;
  }>;
  
  MenuCheckboxItem: ReactComponent<{id: string}>;
  
  MenuRadioItem: ReactComponent<{id: string}>;
  
  MenuControlItem: ReactComponent<{id: string}>;
}
