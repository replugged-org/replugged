import { waitForProps } from "../webpack";

import type { MarginStyles as MarginStylesType } from "discord-client-types/discord_app/styles/shared/Margin.module";

export interface SharedStyles {
  MarginStyles: Record<MarginStylesType, string>;
}

export default {
  MarginStyles: await waitForProps("marginBottom20"),
} as SharedStyles;
