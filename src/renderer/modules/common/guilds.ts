import { waitForProps } from "../webpack";
import type { Guild } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

interface State {
  selectedGuildTimestampMillis: Record<string, number>;
  selectedGuildId: string;
  lastSelectedGuildId: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SelectedGuildStore = {
  getCurrentGuild: () => Guild | undefined;

  getGuildId: () => string | null;
  getLastSelectedGuildId: () => string | null;
  getLastSelectedTimestamp: (guildId: string) => number;
  getState: () => State;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GuildStore = {
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildIds: () => string[];
  getGuilds: () => Record<string, Guild>;
  isLoaded: () => boolean;
};

export type Guilds = SelectedGuildStore & GuildStore;

const guilds: Guilds = {
  ...(await waitForProps(["getGuild", "getGuilds"]).then(Object.getPrototypeOf)),
  ...(await waitForProps(["getGuildId", "getLastSelectedGuildId"]).then(Object.getPrototypeOf)),
};

export function getCurrentGuild(): Guild | undefined {
  const guildId = guilds.getGuildId();
  if (!guildId) return undefined;
  return guilds.getGuild(guildId);
}

export default virtualMerge(guilds, { getCurrentGuild });
