import type React from "react";
import components from "../common/components";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  innerRef?: React.Ref<unknown>;
  focusProps?: Record<string, unknown>;
  className?: string;
}

export type SwitchType = React.FC<React.PropsWithChildren<SwitchProps>>;

interface SwitchItemProps {
  value: boolean;
  onChange: (value: boolean) => void;
  note?: string;
  tooltipNote?: string;
  disabled?: boolean;
  hideBorder?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export type SwitchItemType = React.FC<React.PropsWithChildren<SwitchItemProps>>;

export const { Switch } = components;

export const SwitchItem = components.FormSwitch;
