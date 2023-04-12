import { waitForProps } from "../webpack";
import type { Guild } from "discord-types/general";
import type { Store } from "./flux";
import { virtualMerge } from "src/renderer/util";

export interface State {
  selectedGuildTimestampMillis: Record<string, number>;
  selectedGuildId: string;
  lastSelectedGuildId: string;
}

export type Guilds = (Store & Record<string, unknown>) & {
  getCurrentGuild: () => Guild | undefined;
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildId: () => string | undefined;
  getGuilds: () => Record<string, Guild>;
  getLastSelectedGuildId: () => string | undefined;
  getLastSelectedTimestamp: (guildId: string) => number;
  getState: () => State;
  isLoaded: () => boolean;
};

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
