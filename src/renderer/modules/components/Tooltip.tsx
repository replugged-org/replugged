import { filters, getFunctionBySource, waitForModule } from "../webpack";

const tooltipMod = await waitForModule<Record<string, React.FC>>(
  filters.bySource(/shouldShowTooltip:!1/),
);
const Tooltip = tooltipMod && getFunctionBySource<React.FC>(/shouldShowTooltip:!1/, tooltipMod);

export default Tooltip as React.FC<{
  text: string;
  children: React.FC;
  className?: string;
  style?: React.CSSProperties;
  position?: string;
  align?: string;
  spacing?: number;
  delay?: number;
  shouldShow?: boolean;
}>;
