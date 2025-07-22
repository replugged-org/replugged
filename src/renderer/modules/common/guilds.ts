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
  getAllGuildsRoles: () => Record<string, Record<string, Role>>;
  getRoles: (guildId: string) => Record<string, Role>;
  getRole: (guildId: string, roleId: string) => Role | undefined;
}

export type Guilds = SelectedGuildStore &
  GuildStore &
  GuildRoleStore & { getCurrentGuild: () => Guild | undefined };

const SelectedGuildStore = await waitForProps<SelectedGuildStore & Store>(
  "getGuildId",
  "getLastSelectedGuildId",
);
const GuildStore = await waitForProps<GuildStore & Store>("getGuild", "getGuildIds");
const GuildRoleStore = await waitForProps<GuildRoleStore & Store>("getAllGuildsRoles", "getRoles");

const { getGuild, getGuildIds, getGuilds, getGuildsArray } = GuildStore;

export function getCurrentGuild(): Guild | undefined {
  const guildId = SelectedGuildStore.getGuildId();
  if (!guildId) return undefined;
  return GuildStore.getGuild(guildId);
}

export default virtualMerge(
  Object.getPrototypeOf(SelectedGuildStore),
  Object.getPrototypeOf(GuildStore),
  Object.getPrototypeOf(GuildRoleStore),
  { getGuild, getGuildIds, getGuilds, getGuildsArray, getCurrentGuild },
) as Guilds;
