import type React from "react";
import type { ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

export type SwitchType = ReactComponent<{
  checked: boolean;
  onChange: (e: boolean) => void;
  disabled?: boolean;
  className?: string;
}>;

export type SwitchItemType = ReactComponent<{
  value: boolean;
  onChange: (e: boolean) => void;
  note?: string;
  tooltipNote?: string;
  disabled?: boolean;
  hideBorder?: boolean;
  style?: React.CSSProperties;
  className?: string;
}>;

const switchModStr = "xMinYMid meet";
const switchItemStr = ").dividerDefault";

export const Switch = await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod as SwitchType;
  return getFunctionBySource<SwitchType>(mod, switchModStr);
});

export const SwitchItem = await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod as SwitchItemType;
  return getFunctionBySource<SwitchItemType>(mod, switchItemStr);
});
