import type { Guild, Role } from "discord-types/general";
import { getBoundMethods, virtualMerge } from "src/renderer/util";
import { waitForStore } from "../webpack";
import type { Store } from "./flux";

interface State {
  selectedGuildTimestampMillis: Record<string, number>;
  selectedGuildId: string;
  lastSelectedGuildId: string;
}

export interface SelectedGuildStore {
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
  getGuildsArray: () => Guild[];
}

export interface GuildRoleStore {
  getRole: (guildId: string, roleId: string) => Role | undefined;
  getEveryoneRole: (guild: Guild) => Role | undefined;
  getManyRoles: (guildId: string, roleIds: string[]) => Role[];
  getNumRoles: (guildId: string) => number;
  getRolesSnapshot: (guildId: string) => Record<string, Role>;
  getSortedRoles: (guildId: string) => Role[];
  getUnsafeMutableRoles: (guildId: string) => Record<string, Role>;
  serializeAllGuildRoles: () => Array<{
    partitionKey: string;
    values: Record<string, Role>;
  }>;
}

export type Guilds = SelectedGuildStore &
  GuildStore &
  GuildRoleStore & { getCurrentGuild: () => Guild | undefined };

const SelectedGuildStore = await waitForStore<SelectedGuildStore & Store>("SelectedGuildStore");
const GuildStore = await waitForStore<GuildStore & Store>("GuildStore");
const GuildRoleStore = await waitForStore<GuildRoleStore & Store>("GuildRoleStore");

const { getGuild, getGuildIds, getGuilds, getGuildsArray } = GuildStore;

const { getRolesSnapshot, getSortedRoles } = GuildRoleStore;

export function getCurrentGuild(): Guild | undefined {
  const guildId = SelectedGuildStore.getGuildId();
  if (!guildId) return undefined;
  return GuildStore.getGuild(guildId);
}

export default virtualMerge(
  getBoundMethods(SelectedGuildStore),
  getBoundMethods(GuildStore),
  getBoundMethods(GuildRoleStore),
  {
    getGuild,
    getGuildIds,
    getGuilds,
    getGuildsArray,
    getRolesSnapshot,
    getSortedRoles,
    getCurrentGuild,
  },
) as Guilds;
