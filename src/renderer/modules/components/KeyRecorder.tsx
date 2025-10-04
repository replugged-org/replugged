import { React } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { filters, waitForModule } from "@webpack";
import { Anchor, FormControl } from ".";

import type {
  KeybindRecorder,
  KeybindRecorderProps,
} from "discord-client-types/discord_app/components/common/KeyRecorder";
import type * as Design from "discord-client-types/discord_app/design/web";
import type { KeyCombo } from "discord-client-types/discord_app/modules/keyboard_shortcuts/web/KeyRecorder";

import "./KeyRecorder.css";

const KeyRecorder = await waitForModule<typeof KeybindRecorder>(
  filters.bySource("handleComboChange"),
);

interface CustomKeyRecorderProps
  extends Omit<KeybindRecorderProps, "defaultValue">,
    Pick<
      Design.FormControlProps,
      "label" | "description" | "helperText" | "errorMessage" | "successMessage" | "layout"
    > {
  value?: KeyCombo;
  clearable?: boolean;
}

export type CustomKeyRecorderType = React.FC<CustomKeyRecorderProps>;

export function CustomKeyRecorder({
  value = [],
  onChange,
  clearable = false,
  disabled,
  ...props
}: CustomKeyRecorderProps): React.ReactElement {
  const [keybind, setKeybind] = React.useState(value);

  function handleChange(value: KeyCombo): void {
    setKeybind(value);
    onChange?.(value);
  }

  return (
    <FormControl disabled={disabled} {...props}>
      <KeyRecorder defaultValue={keybind} onChange={handleChange} disabled={disabled} />
      {clearable && (keybind.length || 0) > 0 && (
        <Anchor onClick={() => handleChange([])} className="replugged-key-recorder-clear">
          {intl.string(discordT.CLEAR)}
        </Anchor>
      )}
    </FormControl>
  );
}
