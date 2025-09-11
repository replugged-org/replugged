import type { Channel } from "discord-types/general";
import { getBoundMethods, virtualMerge } from "src/renderer/util";
import { waitForStore } from "../webpack";
import type { Store } from "./flux";

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

interface DebugInfo {
  guildSizes: Record<number, string>;
  loadedGuildIds: string[];
  pendingGuildLoads: string[];
}

export interface ChannelStore {
  getAllThreadsForParent(channelId: string): Channel[];
  getBasicChannel(channelId: string): Channel | undefined;
  getChannel(channelId: string): Channel | undefined;
  getChannelIds(guildId?: string): string[];
  getDebugInfo(): DebugInfo;
  getDMChannelFromUserId(userId: string): Channel | undefined;
  getDMFromUserId(userId: string): string | undefined;
  getDMUserIds(): string[];
  getGuildChannelsVersion(guildId: string): number;
  getInitialOverlayState(): Record<string, Channel>;
  getMutableBasicGuildChannelsForGuild(guildId: string): Record<string, Channel>;
  getMutableDMsByUserIds(): Record<string, string>;
  getMutableGuildChannelsForGuild(guildId: string): Record<string, Channel>;
  getMutablePrivateChannels(): Record<string, Channel>;
  getPrivateChannelsVersion(): number;
  getSortedPrivateChannels(): Channel[];
  hasChannel(channelId: string): boolean;
  loadAllGuildAndPrivateChannelsFromDisk(): Record<string, Channel>;
}

const SelectedChannelStore = await waitForStore<SelectedChannelStore & Store>(
  "SelectedChannelStore",
);
const ChannelStore = await waitForStore<ChannelStore & Store>("ChannelStore");

export type Channels = SelectedChannelStore & ChannelStore;

export default virtualMerge(
  getBoundMethods(SelectedChannelStore),
  getBoundMethods(ChannelStore),
) as Channels;
