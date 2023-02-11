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

interface AlertProps {
  title?: string;
  body?: string | React.ReactElement;
  confirmColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onCloseCallback?: () => void;
  secondaryConfirmText?: string;
  onConfirmSecondary?: () => void;
  className?: string;
}

interface AlertMod {
  show: (props: AlertProps) => void;
  close: () => void;
}

const defaultConfirmProps: Partial<AlertProps> = {
  title: "Are you sure you want to continue?",
  cancelText: "Cancel",
};

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
  alert: (props: AlertProps) => void;
  confirm: (props: AlertProps) => Promise<boolean | null>;
}

const mod = await waitForModule(filters.bySource("onCloseRequest:null!="));
const alertMod = await waitForModule<RawModule & AlertMod>(filters.byProps("show", "close"));

const classes = getBySource<RawModule & ModalClasses>("().justifyStart")!;

export default {
  openModal: getFunctionBySource<Modal["openModal"]>(
    mod as ObjectExports,
    "onCloseRequest:null!=",
  )!,
  closeModal: getFunctionBySource<Modal["closeModal"]>(mod as ObjectExports, "onCloseCallback&&")!,
  Direction: classes?.Direction,
  Align: classes?.Align,
  Justify: classes?.Justify,
  Wrap: classes?.Wrap,
  alert: alertMod.show,
  confirm: (props: AlertProps) =>
    new Promise((resolve) => {
      let didResolve = false;
      const onConfirm = (): void => {
        if (props.onConfirm) props.onConfirm();
        didResolve = true;
        resolve(true);
      };
      const onCancel = (): void => {
        if (props.onCancel) props.onCancel();
        didResolve = true;
        resolve(false);
      };
      const onCloseCallback = (): void => {
        if (props.onCloseCallback) props.onCloseCallback();
        setTimeout(() => {
          if (!didResolve) resolve(null);
        }, 0);
      };
      alertMod.show({ ...defaultConfirmProps, ...props, onConfirm, onCancel, onCloseCallback });
    }),
} as Modal;
