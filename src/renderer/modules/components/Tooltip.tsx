import { HTMLAttributes } from "react";
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
  children: (props: HTMLAttributes<HTMLSpanElement>) => React.ReactElement;
}

interface TooltipCustom extends BaseTooltipProps {
  children: React.ReactElement;
}

type OriginalTooltipType = React.FC<TooltipFunctionChildren>;

export type TooltipType = React.FC<TooltipCustom>;

const rawTooltipMod = await waitForModule<Record<string, React.FC>>(
  filters.bySource(/shouldShowTooltip:!1/),
);

const TooltipMod = getFunctionBySource<React.FC>(
  /shouldShowTooltip:!1/,
  rawTooltipMod,
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
