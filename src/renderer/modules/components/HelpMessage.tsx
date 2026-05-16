import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export type CustomHelpMessage = Design.HelpMessage & {
  // Backwards compatibility
  Types: typeof Design.HelpMessageTypes;
  HelpMessageTypes: typeof Design.HelpMessageTypes;
};

const helpMessageRegex = /messageType:\i,action/;
const mod = await waitForModule(filters.bySource(helpMessageRegex));

const HelpMessage = getFunctionBySource<CustomHelpMessage>(mod, /messageType:\i,action/)!;
const HelpMessageTypes = getExportsForProps<typeof Design.HelpMessageTypes>(mod, [
  "INFO",
  "ERROR",
])!;

HelpMessage.HelpMessageTypes = HelpMessageTypes;
HelpMessage.Types = HelpMessageTypes;

export default HelpMessage;
