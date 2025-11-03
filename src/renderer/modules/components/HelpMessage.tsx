import { getExportsForProps, getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export type CustomHelpMessage = Design.HelpMessage & {
  // Backwards compatibility
  Types: typeof Design.HelpMessageTypes;
  HelpMessageTypes: typeof Design.HelpMessageTypes;
};

const HelpMessage = getFunctionBySource<CustomHelpMessage>(components, /messageType:\i,action/)!;
const HelpMessageTypes = getExportsForProps<typeof Design.HelpMessageTypes>(components, [
  "INFO",
  "ERROR",
])!;

HelpMessage.HelpMessageTypes = HelpMessageTypes;
HelpMessage.Types = HelpMessageTypes;

export default HelpMessage;
