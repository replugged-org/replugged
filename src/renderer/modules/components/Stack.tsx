import { filters, getComponentBySource, waitForModule } from "@webpack";
import type * as Design from "discord-client-types/discord_app/design/web";

const stackRegex = /"data-wrap":\i/;
const mod = await waitForModule(filters.bySource(stackRegex));

export default getComponentBySource<Design.Stack>(mod, stackRegex)!;
