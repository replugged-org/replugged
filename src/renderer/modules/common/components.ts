import { waitForProps } from "../webpack";
import type { ButtonType } from "../components/ButtonItem";
import type { FormTextCompType, FormTextTypeKey } from "../components/FormText";
import type { FormNoticeType } from "../components/FormNotice";
import type { FormItemCompType } from "../components/FormItem";
import type { DividerType } from "../components/Divider";
import type { CheckboxItemType } from "../components/CheckboxItem";
import type { ModalType } from "../components/Modal";
import type { RadioType } from "../components/RadioItem";
import type { SelectCompType } from "../components/SelectItem";
import type { SliderCompType } from "../components/SliderItem";
import type { SwitchItemType, SwitchType } from "../components/SwitchItem";
import type { TextAreaType } from "../components/TextArea";
import type { TextInputType } from "../components/TextInput";
import type { OriginalTooltipType } from "../components/Tooltip";

// Expand this as needed
interface DiscordComponents {
  Button: ButtonType;
  Checkbox: CheckboxItemType;
  FormDivider: DividerType
  FormItem: FormItemCompType;
  FormNotice: FormNoticeType;
  FormSwitch: SwitchItemType;
  FormText: FormTextCompType;
  FormTextTypes: Record<FormTextTypeKey, string>;
  MenuItem: unknown;
  ModalRoot: ModalType["ModalRoot"];
  ModalContent: ModalType["ModalContent"];
  ModalHeader: ModalType["ModalHeader"];
  ModalFooter: ModalType["ModalFooter"];
  ModalCloseButton: ModalType["ModalCloseButton"];
  RadioGroup: RadioType;
  Select: SelectCompType;
  Slider: SliderCompType;
  Switch: SwitchType;
  TextArea: TextAreaType;
  TextInput: TextInputType;
  Tooltip: OriginalTooltipType;
}

export default await waitForProps<DiscordComponents>("FormText", "MenuItem");
