import { filters, getExportsForProps, waitForModule } from "..";
import { ModuleExports } from "../../../../types";
import { Guild } from "discord-types/general";

export type Guilds = ModuleExports & {
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildId: () => string | undefined;
  getGuilds: () => Record<string, Guild>;
  getLastSelectedGuildId: () => string | undefined;
  getLastSelectedTimeout: () => unknown; // tbd
  getState: () => unknown; // tbd
  getTabsV2SelectedGuildId: () => string | undefined;
};

const guilds: Guilds = {
  ...(await waitForModule(filters.byProps("getGuild", "getGuilds")).then(Object.getPrototypeOf)),
  ...(await waitForModule(filters.byProps("getGuildId", "getLastSelectedGuildId")).then((mod) =>
    Object.getPrototypeOf(getExportsForProps(mod, ["getGuildId", "getLastSelectedGuildId"])),
  )),
};

export default guilds;
