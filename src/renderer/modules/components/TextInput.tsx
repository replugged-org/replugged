import { getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

// eslint-disable-next-line @typescript-eslint/no-deprecated
export default getFunctionBySource<Design.TextInputLegacy>(components, "prefixElement:")!;
