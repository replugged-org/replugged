import type { HTMLAttributes } from "react";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface BaseTooltipProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  position?: string;
  align?: string;
  spacing?: number;
  delay?: number;
  shouldShow?: boolean;
}

interface TooltipFunctionChildren extends BaseTooltipProps {
  children: (props: HTMLAttributes<HTMLSpanElement>) => React.ReactNode;
}

interface TooltipCustom extends BaseTooltipProps {
  children: React.ReactNode;
}

type OriginalTooltipType = React.FC<TooltipFunctionChildren>;

export type TooltipType = React.FC<TooltipCustom>;

const rawTooltipMod = await waitForModule<Record<string, React.FC>>(
  filters.bySource(/shouldShowTooltip:!1/),
);

const TooltipMod = getFunctionBySource<React.FC>(
  rawTooltipMod,
  /shouldShowTooltip:!1/,
) as OriginalTooltipType;

const Tooltip: TooltipType = (props) => (
  <TooltipMod {...props}>
    {(tooltipProps) => {
      if (props.className) {
        if (tooltipProps.className) {
          tooltipProps.className += ` ${props.className}`;
        } else {
          tooltipProps.className = props.className;
        }
      }
      if (props.style) {
        if (tooltipProps.style) {
          tooltipProps.style = { ...tooltipProps.style, ...props.style };
        } else {
          tooltipProps.style = props.style;
        }
      }

      return <span {...tooltipProps}>{props.children}</span>;
    }}
  </TooltipMod>
);

export default Tooltip;
