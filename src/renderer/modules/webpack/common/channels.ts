import { filters, getExportsForProps, waitForModule } from "..";

export interface Channels {
  getChannelId: (unknownParam?: string) => string | undefined;
  getCurrentlySelectedChannelId: (unknownParam?: string) => string | undefined; // tbd
  getLastChannelFollowingDestination: () => unknown; // tbd
  getLastSelectedChannelId: (unknownParam: unknown) => string | undefined; // tbd
  getLastSelectedChannels: (unknownParam: unknown) => unknown; // tbd
  getMostRecentSelectedTextChannelId: (unknownParam: unknown) => string | undefined; // tbd
  getVoiceChannelId: (unknownParam?: string) => string | undefined; // tbd
}

export default (await waitForModule(
  filters.byProps("getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"),
).then((mod) =>
  Object.getPrototypeOf(
    getExportsForProps(mod, ["getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"]),
  ),
)) as Channels;
