import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { Field } from ".";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export const ColorPicker = getFunctionBySource<Design.ColorPicker>(
  components,
  'id:"color-picker"',
)!;

interface ColorSwatchProps
  extends Pick<Design.CustomColorPickerProps, "onChange" | "suggestedColors" | "showEyeDropper"> {
  onClose?: Design.PopoutProps["onRequestClose"];
  color?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  colorPickerMiddle?: Design.CustomColorPickerProps["middle"];
  colorPickerFooter?: Design.CustomColorPickerProps["footer"];
}

type ColorSwatchType = React.FC<ColorSwatchProps>;

const ColorSwatch = await waitForModule<ColorSwatchType>(filters.bySource(/colorPickerMiddle:\i,/));

interface ColorPickerItemProps
  extends ColorSwatchProps,
    Pick<
      Design.FieldProps,
      "label" | "description" | "helperText" | "successMessage" | "errorMessage"
    > {
  value?: number;
}

export type ColorPickerItemType = React.FC<ColorPickerItemProps>;

function ColorPickerItem({
  value,
  disabled,
  label,
  description,
  helperText,
  successMessage,
  errorMessage,
  ...props
}: ColorPickerItemProps): React.ReactElement {
  return (
    <Field
      label={label}
      description={description}
      helperText={helperText}
      successMessage={successMessage}
      errorMessage={errorMessage}>
      <ColorSwatch color={value} disabled={disabled} {...props} />
    </Field>
  );
}

export default ColorPickerItem;
