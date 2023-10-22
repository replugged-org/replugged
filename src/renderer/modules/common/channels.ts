import { waitForProps } from "../webpack";
import type { Channel } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

interface LastChannelFollowingDestination {
  channelId: string;
  guildId: string;
}

export interface SelectedChannelStore {
  getChannelId: (guildId?: string, fallbackToDefault?: boolean) => string | undefined;
  getCurrentlySelectedChannelId: (guildId?: string) => string | undefined;
  getLastChannelFollowingDestination: () => LastChannelFollowingDestination;
  getLastSelectedChannelId: (guildId?: string) => string | undefined;
  getLastSelectedChannels: (guildId: string) => string | undefined;
  getMostRecentSelectedTextChannelId: (guildId?: string) => string | null;
  getVoiceChannelId: () => string | null;
}

export interface ChannelStore {
  getAllThreadsForParent(channelId: string): Channel[];
  getBasicChannel(channelId: string): Channel | undefined;
  getChannel(channelId: string): Channel | undefined;
  getChannelIds(guildId?: string): string[];
  getDMFromUserId(userId: string): string | undefined;
  getDMUserIds(): string[];
  getGuildChannelsVersion(guildId: string): number;
  getInitialOverlayState(): Record<string, Channel>;
  getMutableBasicGuildChannelsForGuild(guildId: string): Record<string, Channel>;
  getMutableGuildChannelsForGuild(guildId: string): Record<string, Channel>;
  getMutablePrivateChannels(): Record<string, Channel>;
  getPrivateChannelsVersion(): number;
  getSortedPrivateChannels(): Channel[];
  hasChannel(channelId: string): boolean;
  loadAllGuildAndPrivateChannelsFromDisk(): Record<string, Channel>;
}

export type Channels = SelectedChannelStore & ChannelStore;

export default virtualMerge(
  (await waitForProps<SelectedChannelStore>(
    "getChannelId",
    "getLastSelectedChannelId",
    "getVoiceChannelId",
  ).then(Object.getPrototypeOf)) as SelectedChannelStore,
  (await waitForProps<ChannelStore>("getChannel", "hasChannel").then(
    Object.getPrototypeOf,
  )) as ChannelStore,
);
