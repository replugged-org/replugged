import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

interface CustomTooltipProps extends Omit<Design.TooltipProps, "children"> {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export type CustomTooltipType = React.FC<CustomTooltipProps>;

const Tooltip = getFunctionBySource<Design.Tooltip>(components, "shouldShowTooltip")!;

function CustomTooltip({
  children,
  className,
  style,
  ...props
}: CustomTooltipProps): React.ReactElement {
  return (
    <Tooltip {...props}>
      {(tooltipProps) => {
        const mergedProps = {
          ...tooltipProps,
          className,
          style,
        };

        return <span {...mergedProps}>{children}</span>;
      }}
    </Tooltip>
  );
}
CustomTooltip.Colors = Tooltip.Colors;

export default CustomTooltip;
