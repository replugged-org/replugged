import type React from "react";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  innerRef?: React.Ref<HTMLInputElement>;
  focusProps?: Record<string, unknown>;
  className?: string;
}

export type SwitchType = React.ComponentType<React.PropsWithChildren<SwitchProps>>;

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

export type SwitchItemType = React.ComponentType<React.PropsWithChildren<SwitchItemProps>>;

const switchModStr = "xMinYMid meet";
const switchItemStr = ").dividerDefault";

export const Switch = (await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchModStr);
})) as SwitchType;

export const SwitchItem = (await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchItemStr);
})) as SwitchItemType;
