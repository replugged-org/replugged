import type { Channel, Message } from "discord-types/general";
import type React from "react";

export interface ButtonItem {
  key?: string;
  label: string;
  icon: React.ComponentType<unknown>;
  message?: Message;
  channel?: Channel;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
}

export type GetButtonItem = (message: Message, channel: Channel) => ButtonItem | null;
