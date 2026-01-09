import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type { Tooltip } from "discord-client-types/discord_app/design/mana/components/Tooltip/Tooltip";

const tooltipString = ".tooltipWithShortcut,";
const mod = await waitForModule(filters.bySource(tooltipString));

export default getFunctionBySource<Tooltip>(mod, tooltipString)!;
