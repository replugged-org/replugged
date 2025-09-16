import { getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export default getFunctionBySource<Design.TextInput>(components, /defaultDirty:\i=!1,leading/)!;
