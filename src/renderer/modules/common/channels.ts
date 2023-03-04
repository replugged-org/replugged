import { waitForProps } from "../webpack";
import type { Store } from "./flux";
import { Channel } from "discord-types/general";

export interface LastChannelFollowingDestination {
  channelId: string;
  guildId: string;
}

export interface Channels extends Store {
  // Selected Channel Store
  getChannelId: (guildId?: string) => string | undefined;
  getCurrentlySelectedChannelId: (guildId?: string) => string | undefined;
  getLastChannelFollowingDestination: () => LastChannelFollowingDestination;
  getLastSelectedChannelId: (guildId?: string) => string | undefined;
  getLastSelectedChannels: (guildId?: string) => string | undefined;
  getMostRecentSelectedTextChannelId: (guildId?: string) => string | undefined;
  getVoiceChannelId: () => string | undefined;

  // ChannelStore
  getAllThreadsForParent(channelId: string): Channel[];
  getChannel(channelId: string): Channel;
  getDMFromUserId(userId: string): Channel;
  getDMUserIds(): string[];
  hasChannel(channelId: string): boolean;
}

export default {
  ...(await waitForProps("getChannelId", "getLastSelectedChannelId", "getVoiceChannelId").then(
    Object.getPrototypeOf,
  )),
  ...(await waitForProps("getChannel", "hasChannel").then(Object.getPrototypeOf)),
} as Channels;
