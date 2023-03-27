import { filters, getExportsForProps, waitForModule } from "../webpack";
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
  getTabsV2SelectedGuildId: () => string | undefined;
  isLoaded: () => boolean;
};

const guilds: Guilds = {
  ...(await waitForModule(filters.byProps("getGuild", "getGuilds")).then(Object.getPrototypeOf)),
  ...(await waitForModule(filters.byProps("getGuildId", "getLastSelectedGuildId")).then((mod) =>
    Object.getPrototypeOf(getExportsForProps(mod, ["getGuildId", "getLastSelectedGuildId"])),
  )),
};

export function getCurrentGuild(): Guild | undefined {
  return guilds.getGuild(guilds.getGuildId());
}

export default virtualMerge(guilds, { getCurrentGuild });
