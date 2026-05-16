import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const fieldSetRegex = /{spacing:\i}=\i\.useContext\(\i\.\i\),\i=\i\.useId/;
const mod = await waitForModule(filters.bySource(fieldSetRegex));

export default getFunctionBySource<Design.FieldSet>(mod, fieldSetRegex)!;
