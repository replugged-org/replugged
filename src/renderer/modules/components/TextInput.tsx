import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const textInputRegex = /defaultDirty:\i=!1,leading/;
const mod = await waitForModule(filters.bySource(textInputRegex));

export default getFunctionBySource<Design.TextInput>(mod, textInputRegex)!;
