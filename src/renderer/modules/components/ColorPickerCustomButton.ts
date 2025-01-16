import type React from "react";
import components from "../common/components";

interface ColorPickerCustomButtonProps {
  color?: number;
  value?: number;
  disabled?: boolean;
  onChange?: (value: number, name: string) => void;
}

export type ColorPickerCustomButtonType = React.ComponentClass<ColorPickerCustomButtonProps> & {
  defaultProps: ColorPickerCustomButtonProps;
};

export default components.ColorPickerCustomButton;
