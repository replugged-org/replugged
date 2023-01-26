import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

export type SwitchItemType = ReactComponent<{
  note?: string;
  value: boolean;
  onChange: (e: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  tooltipNode?: string;
}>;

export type SwitchType = ReactComponent<{
  checked: boolean;
  onChange: (e: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}>;

const switchModStr = "xMinYMid meet";
const switchRgx = /{className:\w+\(\)\(\w+,\w+\.className\)}/;
const switchItemStr = ").dividerDefault";

export const Switch = (await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(switchRgx, mod as ObjectExports);
})) as SwitchType;

export const SwitchItem = (await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(switchItemStr, mod as ObjectExports);
})) as SwitchItemType;
