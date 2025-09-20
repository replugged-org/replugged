import { waitForProps } from "../webpack";

import type { MarginStyles as MarginStylesType } from "discord-client-types/discord_app/styles/shared/Margin.module";

export type MarginStyles = Record<MarginStylesType, string>;

export default await waitForProps<MarginStyles>("marginBottom20");
