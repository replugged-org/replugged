import { React, marginStyles } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { filters, waitForModule } from "@webpack";
import { Button, FormItem } from ".";

import type {
  KeybindRecorder,
  KeybindRecorderProps,
} from "discord-client-types/discord_app/components/common/KeyRecorder";
import type { KeyCombo } from "discord-client-types/discord_app/modules/keyboard_shortcuts/web/KeyRecorder";

const KeyRecorder = await waitForModule<typeof KeybindRecorder>(
  filters.bySource("handleComboChange"),
);

interface CustomKeyRecorderProps extends Omit<KeybindRecorderProps, "defaultValue"> {
  value?: KeyCombo;
  clearable?: boolean;
}

export type CustomKeyRecorderType = React.FC<CustomKeyRecorderProps>;

export function CustomKeyRecorder({
  value = [],
  onChange,
  clearable = false,
  ...props
}: CustomKeyRecorderProps): React.ReactElement {
  const [keybind, setKeybind] = React.useState(value);

  function handleChange(value: KeyCombo): void {
    setKeybind(value);
    onChange?.(value);
  }

  return (
    <>
      <KeyRecorder defaultValue={keybind} onChange={handleChange} {...props} />
      {clearable && (keybind.length || 0) > 0 && (
        <Button look={Button.Looks.LINK} size={Button.Sizes.SMALL} onClick={() => handleChange([])}>
          {intl.string(discordT.CLEAR)}
        </Button>
      )}
    </>
  );
}

interface KeybindItemProps extends CustomKeyRecorderProps {
  note?: string;
  style?: React.CSSProperties;
}

export type KeyRecorderItemType = React.FC<React.PropsWithChildren<KeybindItemProps>>;

export function KeyRecorderItem({
  children,
  style,
  note,
  ...props
}: React.PropsWithChildren<KeybindItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      disabled={props.disabled}
      divider>
      <CustomKeyRecorder {...props} />
    </FormItem>
  );
}
