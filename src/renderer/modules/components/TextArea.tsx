import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";

const mod = await waitForModule(filters.bySource("this.getIsOverflowing()"));

export default getFunctionBySource<typeof VoidDesign.TextAreaLegacy>(
  mod,
  "showCharacterCountFullPadding",
)!;
