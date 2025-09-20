import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";

const textAreaString = "this.getIsOverflowing()";
const mod = await waitForModule(filters.bySource(textAreaString));

export default getFunctionBySource<typeof VoidDesign.TextAreaLegacy>(mod, textAreaString)!;
