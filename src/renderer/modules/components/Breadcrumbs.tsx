import { filters, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export default await waitForModule<typeof Design.Breadcrumbs>(
  filters.bySource(".map(this.renderBreadcrumb)"),
);
