import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const anchorRegex = /,useDefaultUnderlineStyles:\i=!0/;
const mod = await waitForModule(filters.bySource(anchorRegex));

export default getFunctionBySource<Design.Anchor>(mod, anchorRegex)!;
