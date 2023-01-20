import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

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

/**
 * A toggleable SwitchItem
 */
export const Switch = (await waitForModule(filters.bySource("xMinYMid meet"))) as SwitchType;

export const SwitchItem = (await waitForModule(
  filters.bySource(").dividerDefault"),
)) as SwitchItemType;
