import { filters, getFunctionBySource, waitForModule } from "@webpack";
import components from "../common/components";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";
import type * as Design from "discord-client-types/discord_app/design/web";

const switchString = "xMinYMid meet";
const mod = await waitForModule(filters.bySource(switchString));

export const Switch = getFunctionBySource<VoidDesign.Switch>(mod, switchString)!;

export const FormSwitch = getFunctionBySource<Design.FormSwitch>(
  components,
  /hideBorder:\w+=!1,tooltipNote:\w+,onChange/,
)!;
