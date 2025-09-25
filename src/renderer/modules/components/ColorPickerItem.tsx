import { marginStyles } from "@common";
import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export const ColorPicker = getFunctionBySource<Design.ColorPicker>(
  components,
  'id:"color-picker"',
)!;

interface ColorSwatchProps
  extends Pick<Design.CustomColorPickerProps, "onChange" | "suggestedColors" | "showEyeDropper"> {
  onClose?: Design.PopoutProps["onRequestClose"];
  color?: Design.CustomColorPickerProps["value"];
  disabled?: boolean;
  label?: React.ReactNode;
  colorPickerMiddle?: Design.CustomColorPickerProps["middle"];
  colorPickerFooter?: Design.CustomColorPickerProps["footer"];
}

type ColorSwatchType = React.FC<ColorSwatchProps>;

const ColorSwatch = await waitForModule<ColorSwatchType>(filters.bySource(".editPencilIcon,"));

interface ColorPickerItemProps extends ColorSwatchProps {
  note?: string;
  style?: React.CSSProperties;
}

export type ColorPickerItemType = React.FC<React.PropsWithChildren<ColorPickerItemProps>>;

function ColorPickerItem({
  children,
  style,
  note,
  disabled,
  ...props
}: React.PropsWithChildren<ColorPickerItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      disabled={disabled}
      divider>
      <ColorSwatch {...props} />
    </FormItem>
  );
}

export default ColorPickerItem;
