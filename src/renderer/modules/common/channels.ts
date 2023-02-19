import { filters, getExportsForProps, waitForModule } from "../webpack";
import type { Store } from "./flux";

export interface LastChannelFollowingDestination {
  channelId: string;
  guildId: string;
}

export interface Channels extends Store {
  getChannelId: (guildId?: string) => string | undefined;
  getCurrentlySelectedChannelId: (guildId?: string) => string | undefined;
  getLastChannelFollowingDestination: () => LastChannelFollowingDestination;
  getLastSelectedChannelId: (guildId?: string) => string | undefined;
  getLastSelectedChannels: (guildId?: string) => string | undefined;
  getMostRecentSelectedTextChannelId: (guildId?: string) => string | undefined;
  getVoiceChannelId: () => string | undefined;
}

export default (await waitForModule(
  filters.byProps("getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"),
).then((mod) =>
  Object.getPrototypeOf(
    getExportsForProps(mod, ["getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"]),
  ),
)) as Channels;
