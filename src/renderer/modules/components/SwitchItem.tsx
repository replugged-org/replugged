import type React from "react";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

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

const switchModStr = "xMinYMid meet";
const switchItemStr = ").dividerDefault";

export const Switch = await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod as SwitchType;
  return getFunctionBySource<SwitchType>(mod, switchModStr)!;
});

export const SwitchItem = await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod as SwitchItemType;
  return getFunctionBySource<SwitchItemType>(mod, switchItemStr)!;
});
