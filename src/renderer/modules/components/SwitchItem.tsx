import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type SwitchItemType = ReactComponent<{
  note?: string;
  checked: boolean;
  onChange: (e: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  tooltipNode?: string;
}>;

/**
 * A toggleable SwitchItem
 */
export default (await waitForModule(filters.bySource("xMinYMid meet"))) as SwitchItemType;
