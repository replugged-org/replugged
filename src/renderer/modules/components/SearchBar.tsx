import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const searchBarRegex = /autoComplete:\i,inputProps/;
const mod = await waitForModule(filters.bySource(searchBarRegex));

export default getFunctionBySource<Design.SearchBar>(mod, searchBarRegex)!;
