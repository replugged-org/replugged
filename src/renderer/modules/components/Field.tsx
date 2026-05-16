import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const fieldRegex = /layout:\i="vertical",/;
const mod = await waitForModule(filters.bySource(fieldRegex));

export default getFunctionBySource<Design.Field>(mod, fieldRegex)!;
