import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const colorPickerStr = 'id:"color-picker"';
const mod = await waitForModule(filters.bySource(colorPickerStr));

export default getFunctionBySource<Design.ColorPicker>(mod, colorPickerStr)!;
