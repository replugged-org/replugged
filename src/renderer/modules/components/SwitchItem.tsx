import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type SwitchItemType = ReactComponent<{
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
const SwitchItem = (await waitForModule(filters.bySource(").dividerDefault"))) as SwitchItemType;

export default SwitchItem;
