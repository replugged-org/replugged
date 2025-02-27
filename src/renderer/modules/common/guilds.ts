import type { Guild, Role } from "discord-types/general";
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
  getAllGuildsRoles: () => Record<string, Record<string, Role>>;
  getGeoRestrictedGuilds: () => string[];
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildIds: () => string[];
  getGuilds: () => Record<string, Guild>;
  getRole: (guildId: string, roleId: string) => Role | undefined;
  getRoles: (guildId: string) => Record<string, Role>;
  isLoaded: () => boolean;
}

export type Guilds = SelectedGuildStore & GuildStore;

const getGuilds = async (): Promise<ReturnType<typeof virtualMerge> & Guilds> => {
  const GuildStore = await waitForProps<GuildStore & Store>("getGuild", "getGuildIds");
  const SelectedGuildStore = await waitForProps<SelectedGuildStore & Store>(
    "getGuildId",
    "getLastSelectedGuildId",
  );

  function getCurrentGuild(): Guild | undefined {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) return undefined;
    return GuildStore.getGuild(guildId);
  }
  return virtualMerge(
    Object.getPrototypeOf(GuildStore) as GuildStore,
    Object.getPrototypeOf(SelectedGuildStore) as SelectedGuildStore,
    { getCurrentGuild },
  );
};

export default getGuilds();
