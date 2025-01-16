import type React from "react";
import components from "../common/components";

interface ColorPickerDefaultButtonProps {
  customColor?: number,
  value?: number,
  disabled?: boolean,
  "aria-label"?: string;
}

export type ColorPickerDefaultButtonType = React.ComponentClass<ColorPickerDefaultButtonProps> & {
  defaultProps: ColorPickerDefaultButtonProps;
};

export default components.ColorPickerDefaultButton;
