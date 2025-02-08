import type { LoaderType } from "@components";
import type { ClickableCompType } from "@components/Clickable";
import type { NoticeType } from "@components/Notice";
import type { OriginalTextType } from "@components/Text";
import type { ButtonType } from "../components/ButtonItem";
import type { CheckboxType } from "../components/CheckboxItem";
import type { ContextMenuType } from "../components/ContextMenu";
import type { DividerType } from "../components/Divider";
import type { FormItemCompType } from "../components/FormItem";
import type { FormNoticeType } from "../components/FormNotice";
import type { FormTextCompType, FormTextTypeKey } from "../components/FormText";
import type { ModalType } from "../components/Modal";
import type { RadioType } from "../components/RadioItem";
import type { SelectCompType } from "../components/SelectItem";
import type { SliderCompType } from "../components/SliderItem";
import type { SwitchItemType, SwitchType } from "../components/SwitchItem";
import type { TextAreaType } from "../components/TextArea";
import type { TextInputType } from "../components/TextInput";
import type { OriginalTooltipType } from "../components/Tooltip";
import { waitForProps } from "../webpack";
import type { CreateToast, ShowToast } from "./toast";

// Expand this as needed
type DiscordComponents = {
  createToast: CreateToast;
  showToast: ShowToast;
  Text: OriginalTextType;
} & Record<
  string,
  | ButtonType
  | CheckboxType
  | ClickableCompType
  | DividerType
  | FormItemCompType
  | FormNoticeType
  | SwitchItemType
  | FormTextCompType
  | Record<FormTextTypeKey, string>
  | NoticeType
  | NoticeType["HelpMessageTypes"]
  | ContextMenuType["ContextMenu"]
  | ContextMenuType["MenuCheckboxItem"]
  | ContextMenuType["MenuControlItem"]
  | ContextMenuType["MenuGroup"]
  | ContextMenuType["MenuItem"]
  | ContextMenuType["MenuRadioItem"]
  | ContextMenuType["MenuSeparator"]
  | ModalType["ModalCloseButton"]
  | ModalType["ModalContent"]
  | ModalType["ModalFooter"]
  | ModalType["ModalHeader"]
  | ModalType["ModalRoot"]
  | RadioType
  | SelectCompType
  | SliderCompType
  | LoaderType
  | SwitchType
  | TextAreaType
  | TextInputType
  | OriginalTooltipType
  | unknown
>;

export default await waitForProps<DiscordComponents>("ConfirmModal", "ToastPosition", "Text");
