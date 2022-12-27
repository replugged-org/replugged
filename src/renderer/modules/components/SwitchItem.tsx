import { React } from "../webpack/common";
import { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type SwitchItem = ReactComponent<{
  note?: string;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  tooltipNode?: string;
}>;

/**
 * A toggleable SwitchItem
 */
const SwitchItem: SwitchItem = (await waitForModule(filters.bySource(").dividerDefault"), {
  timeout: 10000,
})) as SwitchItem;

export default SwitchItem;
