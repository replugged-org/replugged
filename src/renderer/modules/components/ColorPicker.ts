import type React from "react";
import components from "../common/components";

// From Tooltip.tsx
const Positions = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right",
  CENTER: "center",
  WINDOW_CENTER: "window_center",
} as const;

interface ColorPickerProps {
  className?: string;
  defaultColor?: number;
  customColor?: number;
  colors: number[];
  value?: number;
  disabled?: boolean;
  onChange?: (value: number, name: string) => void;
  renderDefaultButton: (props: object) => React.ReactElement;
  renderCustomButton: (props: object) => React.ReactElement;
  colorContainerClassName?: string;
  customPickerPosition?: (typeof Positions)[keyof typeof Positions];
}

export type ColorPickerType = React.ComponentClass<ColorPickerProps> & {
  defaultProps: ColorPickerProps;
};

export default components.ColorPicker;
