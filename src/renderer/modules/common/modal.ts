import { getFunctionBySource, waitForProps } from "../webpack";
import components from "./components";

import type {
  Close,
  Confirm,
  Show,
  ShowProps,
} from "discord-client-types/discord_app/actions/web/AlertActionCreators";
import type * as Design from "discord-client-types/discord_app/design/web";

interface AlertActionCreators {
  show: Show;
  close: Close;
  confirm: Confirm;
}

const { show } = await waitForProps<AlertActionCreators>("show", "close");

export default {
  openModal: getFunctionBySource<Design.OpenModal>(components, "?.stackNextByDefault===")!,
  closeModal: getFunctionBySource<Design.CloseModal>(components, "onCloseCallback&&")!,
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
