import type { OriginalTextType } from "@components/Text";
import { waitForProps } from "@webpack";
import type { CreateToast, ShowToast } from "./toast";

// Expand this as needed
export type DiscordComponents = {
  createToast: CreateToast;
  showToast: ShowToast;
  Text: OriginalTextType;
} & Record<string, unknown>;

export default await waitForProps<DiscordComponents>("ConfirmModal", "ToastPosition", "Text");
