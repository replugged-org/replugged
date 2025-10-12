import { getExportsForProps, getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as CommonDesign from "discord-client-types/discord_common/packages/design/web";

export type CustomHelpMessage = CommonDesign.HelpMessage & {
  // Backwards compatibility
  Types: typeof CommonDesign.HelpMessageTypes;
  HelpMessageTypes: typeof CommonDesign.HelpMessageTypes;
};

const HelpMessage = getFunctionBySource<CustomHelpMessage>(components, /messageType:\i,action/)!;
const HelpMessageTypes = getExportsForProps<typeof CommonDesign.HelpMessageTypes>(components, [
  "INFO",
  "ERROR",
])!;

HelpMessage.HelpMessageTypes = HelpMessageTypes;
HelpMessage.Types = HelpMessageTypes;

export default HelpMessage;
