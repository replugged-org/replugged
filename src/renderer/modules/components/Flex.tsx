import { filters, waitForModule } from "@webpack";

import type { Flex } from "discord-client-types/discord_app/modules/core/web/Flex";

export default await waitForModule<Flex>(
  filters.bySource(/HORIZONTAL_REVERSE:\i\.horizontalReverse/),
);
