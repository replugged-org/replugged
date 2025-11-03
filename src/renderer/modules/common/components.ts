import { waitForProps } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export type DiscordComponents = {
  Anchor: Design.Anchor;
  Button: Design.Button;
  ButtonGroup: Design.ButtonGroup;
  Checkbox: Design.Checkbox;
  ConfirmModal: Design.ConfirmModal;
  H: Design.H;
  Heading: Design.Heading;
  Text: Design.Text;
  ToastPosition: typeof Design.ToastPosition;
  ToastType: typeof Design.ToastType;
  createToast: Design.CreateToast;
  popToast: Design.PopToast;
  showToast: Design.ShowToast;
} & Record<string, unknown>;

export default await waitForProps<DiscordComponents>("ConfirmModal", "ToastPosition", "Text");
