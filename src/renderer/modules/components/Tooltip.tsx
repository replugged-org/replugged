import type React from "react";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

const Aligns = {
  BOTTOM: "bottom",
  CENTER: "center",
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
} as const;

interface TooltipEnums {
  Aligns: typeof Aligns;
  Positions: Record<"TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER" | "WINDOW_CENTER", string>;
  Colors: Record<
    "PRIMARY" | "BLACK" | "GREY" | "BRAND" | "GREEN" | "YELLOW" | "RED" | "CUSTOM",
    string
  >;
}

interface BaseTooltipProps {
  text: string;
  color?: string;
  position?: string;
  align?: string;
  spacing?: number;
  delay?: number;
  allowOverflow?: boolean;
  disableTooltipPointerEvents?: boolean;
  forceOpen?: boolean;
  hide?: boolean;
  hideOnClick?: boolean;
  shouldShow?: boolean;
  tooltipClassName?: string;
  tooltipContentClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  onAnimationRest?: (e: object, t: object) => void;
}

interface TooltipFunctionChildren extends BaseTooltipProps {
  children: (props: React.HTMLAttributes<HTMLSpanElement>) => React.ReactNode;
}

interface TooltipCustom extends BaseTooltipProps {
  children: React.ReactNode;
}

type OriginalTooltipType = React.FC<TooltipFunctionChildren> & TooltipEnums;

export type TooltipType = React.FC<TooltipCustom> & TooltipEnums;

const tooltipRgx = /shouldShowTooltip:!1/;

const TooltipMod = (await waitForModule(filters.bySource(tooltipRgx)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, tooltipRgx),
)) as OriginalTooltipType;

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
Tooltip.Aligns = Aligns;
Tooltip.Colors = TooltipMod.Colors;
Tooltip.Positions = TooltipMod.Positions;

export default Tooltip;
