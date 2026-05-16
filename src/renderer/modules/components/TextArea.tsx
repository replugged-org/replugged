import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const textAreaStr = 'mana-component":"text-area"';
const mod = await waitForModule(filters.bySource(textAreaStr));

export default getFunctionBySource<Design.TextArea>(mod, textAreaStr)!;
