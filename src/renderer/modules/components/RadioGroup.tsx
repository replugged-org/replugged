import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const radioGroupRegex = /\i=>\i\.onChange\(\i\.value\)/;
const mod = await waitForModule(filters.bySource(radioGroupRegex));

export default getFunctionBySource<Design.RadioGroup>(mod, radioGroupRegex)!;
