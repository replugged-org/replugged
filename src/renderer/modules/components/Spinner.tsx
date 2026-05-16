import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const spinnerRegex = /type:\i="wanderingCubes"/;
const mod = await waitForModule(filters.bySource(spinnerRegex));

export default getFunctionBySource<Design.Spinner>(mod, spinnerRegex)!;
