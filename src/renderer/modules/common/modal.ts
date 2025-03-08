import { filters, getBySource, getFunctionBySource, waitForModule, waitForProps } from "../webpack";

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
  instant?: boolean;
  onCloseRequest?: () => void;
  onCloseCallback?: () => void;
}

interface ModalClasses {
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
}

interface AlertProps {
  title?: React.ReactNode;
  body?: React.ReactNode;
  confirmColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onCloseCallback?: () => void;
  secondaryConfirmText?: string;
  onConfirmSecondary?: () => void;
  className?: string;
  titleClassName?: string;
}

interface AlertMod {
  show: (props: AlertProps) => void;
  close: () => void;
}

const defaultConfirmProps: Partial<AlertProps> = {
  title: "Are you sure you want to continue?",
  cancelText: "Cancel",
};

export type Modal = {
  openModal: (
    render: (props: ModalProps) => React.ReactNode,
    options?: ModalOptions,
    contextKey?: string,
  ) => string;
  closeModal: (modalKey: string, contextKey?: string) => void;
  alert: (props: AlertProps) => void;
  confirm: (props: AlertProps) => Promise<boolean | null>;
} & ModalClasses;

const mod = await waitForModule(filters.bySource("onCloseRequest:null!="));
const alertMod = await waitForProps<AlertMod>("show", "close");

const classes = getBySource<ModalClasses>(".justifyStart")!;

export default {
  openModal: getFunctionBySource<Modal["openModal"]>(mod, "onCloseRequest:null!=")!,
  closeModal: getFunctionBySource<Modal["closeModal"]>(mod, "onCloseCallback&&")!,
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
