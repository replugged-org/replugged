import { waitForProps } from "../webpack";

import type {
  Close,
  Confirm,
  Show,
  ShowProps,
} from "discord-client-types/discord_app/actions/web/AlertActionCreators";
import type {
  CloseModal,
  OpenModal,
} from "discord-client-types/discord_app/design/components/Modal/web/ModalAPI";

interface AlertActionCreators {
  show: Show;
  close: Close;
  confirm: Confirm;
}

interface ModalAPI {
  openModal: OpenModal;
  closeModal: CloseModal;
}

const { show } = await waitForProps<AlertActionCreators>("show", "close");
const { openModal, closeModal } = await waitForProps<ModalAPI>("openModal", "closeModal");

export default {
  openModal,
  closeModal,
  alert: show,
  confirm: (props: ShowProps) =>
    new Promise<boolean | null>((resolve) => {
      let didResolve = false;
      const onConfirm = (): void => {
        if (props.onConfirm) void props.onConfirm();
        didResolve = true;
        resolve(true);
      };
      const onCancel = (): void => {
        if (props.onCancel) void props.onCancel();
        didResolve = true;
        resolve(false);
      };
      const onCloseCallback = (): void => {
        if (props.onCloseCallback) props.onCloseCallback();
        setTimeout(() => {
          if (!didResolve) resolve(null);
        }, 0);
      };
      show({ ...props, onConfirm, onCancel, onCloseCallback });
    }),
};
