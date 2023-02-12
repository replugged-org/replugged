import type { ObjectExports, ReactComponent } from "../../../types";
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
const switchRgx = /{className:\w+\(\)\(\w+,\w+\.className\)}/;
const switchItemStr = ").dividerDefault";

export const Switch = (await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchRgx);
})) as SwitchType;

export const SwitchItem = (await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchItemStr);
})) as SwitchItemType;
