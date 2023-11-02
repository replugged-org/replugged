import type { Guild } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";
import { waitForProps } from "../webpack";
import type { Store } from "./flux";

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

const GuildStore = await waitForProps<GuildStore & Store>("getGuild", "getGuildIds");
const SelectedGuildStore = await waitForProps<SelectedGuildStore & Store>(
  "getGuildId",
  "getLastSelectedGuildId",
);

export function getCurrentGuild(): Guild | undefined {
  const guildId = SelectedGuildStore.getGuildId();
  if (!guildId) return undefined;
  return GuildStore.getGuild(guildId);
}

export default virtualMerge(
  Object.getPrototypeOf(GuildStore) as GuildStore,
  Object.getPrototypeOf(SelectedGuildStore) as SelectedGuildStore,
  { getCurrentGuild },
);
