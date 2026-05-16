import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const clickableStr = "this.renderNonInteractive()";
const mod = await waitForModule(filters.bySource(clickableStr));

export default getFunctionBySource<typeof Design.Clickable>(mod, clickableStr)!;
