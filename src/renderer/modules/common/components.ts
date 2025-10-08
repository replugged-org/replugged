import { waitForProps } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export type DiscordComponents = {
  Text: Design.Text;
  ToastPosition: typeof Design.ToastPosition;
  ToastType: typeof Design.ToastType;
  createToast: Design.CreateToast;
  popToast: Design.PopToast;
  showToast: Design.ShowToast;
} & Record<string, unknown>;

export default await waitForProps<DiscordComponents>("ConfirmModal", "ToastPosition", "Text");
