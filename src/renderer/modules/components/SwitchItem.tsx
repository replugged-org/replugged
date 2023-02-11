import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

export type SwitchType = ReactComponent<{
  checked: boolean;
  onChange: (e: boolean) => void;
  disabled?: boolean;
  className?: string;
}>;

interface SwitchItemCompProps {
  value: boolean;
  onChange: (e: boolean) => void;
  note?: string;
  tooltipNote?: string;
  disabled?: boolean;
  hideBorder?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

type SelectCompType = React.ComponentType<SwitchItemCompProps>;

interface SwitchItemProps extends SwitchItemCompProps {
  divider?: boolean;
}

export type SwitchItemType = React.FC<React.PropsWithChildren<SwitchItemProps>>;

const switchModStr = "xMinYMid meet";
const switchRgx = /{className:\w+\(\)\(\w+,\w+\.className\)}/;
const switchItemStr = ").dividerDefault";

export const Switch = (await waitForModule(filters.bySource(switchModStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchRgx);
})) as SwitchType;

const SwitchItemComp = (await waitForModule(filters.bySource(switchItemStr)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(mod as ObjectExports, switchItemStr);
})) as SelectCompType;

export const SwitchItem = ((props) => {
  if (props.divider) props.hideBorder = props.divider;
  return <SwitchItemComp {...props} />;
}) as SwitchItemType;
