import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

import type { TooltipProps } from "discord-client-types/discord_app/design/components/Tooltip/web/Tooltip";
import type * as Design from "discord-client-types/discord_app/design/web";

interface CustomTooltipProps extends Omit<TooltipProps, "children"> {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export type CustomTooltipType = React.FC<CustomTooltipProps>;

const Tooltip = getFunctionBySource<Design.Tooltip>(components, "shouldShowTooltip")!;

const CustomTooltip = (props: CustomTooltipProps): React.ReactElement => (
  <Tooltip {...props}>
    {(tooltipProps) => {
      const mergedProps = {
        ...tooltipProps,
        className: props.className,
        style: props.style,
      };

      return <span {...mergedProps}>{props.children}</span>;
    }}
  </Tooltip>
);
CustomTooltip.Colors = Tooltip.Colors;

export default CustomTooltip;
