import { waitForProps } from "../webpack";
import type { Store } from "./flux";
import { Channel } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";
import { FullObjectExports } from "src/types";

export interface LastChannelFollowingDestination {
  channelId: string;
  guildId: string;
}

export type SelectedChannelStore = (Store & Record<string, unknown>) & {
  getChannelId: (guildId?: string) => string | undefined;
  getCurrentlySelectedChannelId: (guildId?: string) => string | undefined;
  getLastChannelFollowingDestination: () => LastChannelFollowingDestination;
  getLastSelectedChannelId: (guildId?: string) => string | undefined;
  getLastSelectedChannels: (guildId: string) => string | undefined;
  getMostRecentSelectedTextChannelId: (guildId?: string) => string | undefined;
  getVoiceChannelId: () => string | undefined;
};

export type ChannelStore = (Store & Record<string, unknown>) & {
  getAllThreadsForParent(channelId?: string): Channel[];
  getBasicChannel(channelId: string): Channel | undefined;
  getCachedChannelJsonForGuild(channelId: string): unknown;
  getChannel(channelId: string): Channel | undefined;
  getDMFromUserId(userId: string): string | undefined;
  getDMUserIds(): string[];
  getGuildChannelsVersion(guildId?: string): number;
  getInitialOverlayState(): Record<string, Channel>;
  getMutableBasicGuildChannelsForGuild(guildId?: string): Record<string, Channel>;
  getMutableGuildChannelsForGuild(guildId?: string): Record<string, Channel>;
  getMutablePrivateChannels(): Record<string, Channel>;
  getPrivateChannelsVersion(): number;
  getSortedPrivateChannels(): Channel[];
  hasChannel(channelId: string): boolean;
  hasRestoredGuild(guildId: string): boolean;
  loadAllGuildAndPrivateChannelsFromDisk(): Record<string, Channel>;
};

export type Channels = SelectedChannelStore & ChannelStore;

export default virtualMerge(
  await waitForProps<keyof SelectedChannelStore, FullObjectExports & SelectedChannelStore>([
    "getChannelId",
    "getLastSelectedChannelId",
    "getVoiceChannelId",
  ]).then(Object.getPrototypeOf),
  await waitForProps<keyof ChannelStore, FullObjectExports & ChannelStore>([
    "getChannel",
    "hasChannel",
  ]).then(Object.getPrototypeOf),
);
