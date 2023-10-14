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

const Positions = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right",
  CENTER: "center",
  WINDOW_CENTER: "window_center",
} as const;

interface TooltipEnums {
  Aligns: typeof Aligns;
  Positions: typeof Positions;
  Colors: Record<
    "PRIMARY" | "BLACK" | "GREY" | "BRAND" | "GREEN" | "YELLOW" | "RED" | "CUSTOM" | "PREMIUM",
    string
  >;
}

interface BaseTooltipProps {
  text: string;
  color?: string;
  position?: (typeof Positions)[keyof typeof Positions];
  align?: (typeof Aligns)[keyof typeof Aligns];
  spacing?: number;
  delay?: number;
  allowOverflow?: boolean;
  disableTooltipPointerEvents?: boolean;
  forceOpen?: boolean;
  hideOnClick?: boolean;
  clickableOnMobile?: boolean;
  shouldShow?: boolean;
  "aria-label"?: string;
  className?: string;
  tooltipClassName?: string;
  tooltipContentClassName?: string;
  style?: React.CSSProperties;
  onTooltipShow?: () => void;
  onAnimationRest?: (result: unknown, spring: unknown, item?: unknown) => void;
}

interface TooltipFunctionChildren extends BaseTooltipProps {
  children: (props: React.ComponentPropsWithoutRef<"span">) => React.ReactNode;
}

interface TooltipCustom extends BaseTooltipProps {
  children: React.ReactNode;
}

type OriginalTooltipType = React.ComponentClass<TooltipFunctionChildren> & TooltipEnums;

export type TooltipType = React.FC<TooltipCustom> & TooltipEnums;

const tooltipRgx = /shouldShowTooltip:!1/;

const TooltipMod = await waitForModule(filters.bySource(/tooltipTop,.{0,20}tooltipBottom/)).then(
  (mod) => getFunctionBySource<OriginalTooltipType>(mod as ObjectExports, tooltipRgx)!,
);

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
Tooltip.Positions = Positions;

export default Tooltip;
