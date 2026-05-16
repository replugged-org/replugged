import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const tabBarStr = "this.tabBarRef.current";
const mod = await waitForModule(filters.bySource(tabBarStr));

export default getFunctionBySource<Design.TabBar>(mod, tabBarStr)!;
