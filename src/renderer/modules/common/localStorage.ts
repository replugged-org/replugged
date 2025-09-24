import { filters, getExportsForProps, waitForModule } from "../webpack";

import type { LocalStorage } from "discord-client-types/discord_common/packages/storage/web/Storage";

const storageMod = await waitForModule(filters.bySource("delete window.localStorage"));

export default getExportsForProps<LocalStorage>(storageMod, ["getAfterRefresh"])!;
