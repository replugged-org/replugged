import { getComponentBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export default getComponentBySource<Design.FormSection>(components, ".sectionTitle,")!;
