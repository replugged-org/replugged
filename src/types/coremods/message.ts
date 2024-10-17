import type { Channel, Message } from "discord-types/general";
import type React from "react";

interface ButtonPopoverProps extends React.ComponentPropsWithoutRef<"div"> {
  selected?: boolean;
  disabled?: boolean;
  dangerous?: boolean;
}

export interface HoverBarButtonProps extends ButtonPopoverProps {
  label: string;
  ariaLabel?: string;
  tooltipText?: string;
  tooltipColor?: string;
  icon: React.ComponentType<unknown>;
  iconProps?: Record<string, unknown>;
  onTooltipShow?: () => void;
  onTooltipHide?: () => void;
  separator?: boolean;
  sparkle?: boolean;
  showNewBadge?: boolean;
  buttonClassName?: string;
}

export type GetButtonItem = (message: Message, channel: Channel) => HoverBarButtonProps | null;
