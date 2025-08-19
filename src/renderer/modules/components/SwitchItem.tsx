import { getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export const Switch = getFunctionBySource<Design.Switch>(components, "xMinYMid meet")!;

export const FormSwitch = getFunctionBySource<Design.FormSwitch>(
  components,
  /hideBorder:\w+=!1,tooltipNote:\w+,onChange/,
)!;
