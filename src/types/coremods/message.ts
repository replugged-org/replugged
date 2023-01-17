import { Channel, Message } from "discord-types/general";
import { MouseEventHandler } from "react";

export interface ButtonItem {
  key: string;
  label: string;
  icon: React.ComponentType<unknown>;
  message?: Message;
  channel?: Channel;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: MouseEventHandler<HTMLButtonElement>;
}

export type GetButtonItem = (message: Message, channel: Channel) => ButtonItem | null;
