import { filters, waitForModule } from "../webpack";

import type { MarginStyles as MarginStylesType } from "discord-client-types/discord_app/styles/shared/Margin.module";

export type MarginStyles = Record<MarginStylesType, string>;

export default await waitForModule<MarginStyles>(filters.bySource("marginBottom20_"));
