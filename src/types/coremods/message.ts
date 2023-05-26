import type { Channel, Message } from "discord-types/general";
import type React from "react";

interface ButtonPopoverProps extends React.ComponentPropsWithoutRef<"div"> {
  selected?: boolean;
  disabled?: boolean;
  dangerous?: boolean;
}

export interface IconButtonProps extends Omit<ButtonPopoverProps, "onClick"> {
  label: string;
  channel: Channel;
  message: Message;
  onClick: (channel: Channel, message: Message, event: React.MouseEvent<HTMLDivElement>) => void;
  ariaLabel?: string;
  tooltipText?: string;
  tooltipColor?: string;
  icon?: React.ReactNode;
  iconProps?: Record<string, unknown>;
  key?: string;
  separator?: boolean;
  sparkle?: boolean;
}

export type GetButtonItem = (message: Message, channel: Channel) => IconButtonProps | null;
