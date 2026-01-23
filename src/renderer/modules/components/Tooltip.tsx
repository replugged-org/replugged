import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type { Tooltip } from "discord-client-types/discord_app/design/mana/components/Tooltip/Tooltip";

const tooltipRegex = /keyboardShortcut:\i,__unsupported/;
const mod = await waitForModule(filters.bySource(tooltipRegex));

export default getFunctionBySource<Tooltip>(mod, tooltipRegex)!;
