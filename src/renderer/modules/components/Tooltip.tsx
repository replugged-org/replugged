import type React from "react";
import components from "../common/components";

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
    "PRIMARY" | "NESTED" | "BLACK" | "GREY" | "BRAND" | "GREEN" | "YELLOW" | "RED" | "PREMIUM",
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
  overflowOnly?: boolean;
  disableTooltipPointerEvents?: boolean;
  forceOpen?: boolean;
  hideOnClick?: boolean;
  clickableOnMobile?: boolean;
  shouldShow?: boolean;
  "aria-label"?: string;
  className?: string;
  tooltipClassName?: string;
  tooltipContentClassName?: string;
  tooltipPointerClassName?: string;
  style?: React.CSSProperties;
  tooltipStyle?: React.CSSProperties;
  onTooltipShow?: () => void;
  onTooltipHide?: () => void;
  onAnimationRest?: (result: unknown, spring: unknown, item?: unknown) => void;
}

interface TooltipFunctionChildren extends BaseTooltipProps {
  children: (props: React.ComponentPropsWithoutRef<"span">) => React.ReactNode;
}

interface TooltipCustom extends BaseTooltipProps {
  children: React.ReactNode;
}

export type OriginalTooltipType = React.ComponentClass<TooltipFunctionChildren> & TooltipEnums;

export type TooltipType = React.FC<TooltipCustom> & TooltipEnums;

const TooltipMod = components.Tooltip;

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
