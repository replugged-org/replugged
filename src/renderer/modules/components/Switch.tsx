import { getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export default getFunctionBySource<Design.Switch>(components, /return\(0,\i\.\i\)\("Switch"\)/)!;
