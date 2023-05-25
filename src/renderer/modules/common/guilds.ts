import { waitForProps } from "../webpack";
import type { Guild } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

interface State {
  selectedGuildTimestampMillis: Record<string, number>;
  selectedGuildId: string;
  lastSelectedGuildId: string;
}

export interface SelectedGuildStore {
  getCurrentGuild: () => Guild | undefined;

  getGuildId: () => string | null;
  getLastSelectedGuildId: () => string | null;
  getLastSelectedTimestamp: (guildId: string) => number;
  getState: () => State;
}

export interface GuildStore {
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildIds: () => string[];
  getGuilds: () => Record<string, Guild>;
  isLoaded: () => boolean;
}

export type Guilds = SelectedGuildStore & GuildStore;

const guilds: Guilds = {
  ...(await waitForProps<GuildStore>("getGuild", "getGuilds").then(Object.getPrototypeOf)),
  ...(await waitForProps<SelectedGuildStore>(["getGuildId", "getLastSelectedGuildId"]).then(
    Object.getPrototypeOf,
  )),
};

export function getCurrentGuild(): Guild | undefined {
  const guildId = guilds.getGuildId();
  if (!guildId) return undefined;
  return guilds.getGuild(guildId);
}

export default virtualMerge(guilds, { getCurrentGuild });
