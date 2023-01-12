import type { RawModule } from "../../../../types/webpack";
import { filters, waitForModule } from "..";

interface ConfirmProps {
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

interface ConfirmMod {
  show: (props: ConfirmProps) => void;
  close: () => void;
}

export interface Confirm extends ConfirmMod {
  confirm: (props?: ConfirmProps) => Promise<boolean | null>;
}

const mod = await waitForModule<RawModule & ConfirmMod>(filters.byProps("show", "close"));

const defaultConfirmProps: Partial<ConfirmProps> = {
  title: "Are you sure you want to continue?",
  cancelText: "Cancel",
};

export default {
  ...mod,
  confirm: (props: ConfirmProps = {}) =>
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
      mod.show({ ...defaultConfirmProps, ...props, onConfirm, onCancel, onCloseCallback });
    }),
} as Confirm;
