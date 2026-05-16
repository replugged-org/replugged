import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const dividerRegex = /style:{marginTop:\i,marginBottom:\i}/;
const mod = await waitForModule(filters.bySource(dividerRegex));

export default getFunctionBySource<Design.Divider>(mod, dividerRegex)!;
