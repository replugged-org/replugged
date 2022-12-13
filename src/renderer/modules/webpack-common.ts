import { Filter, ModuleExports, webpack } from "@replugged";
const { filters, waitForModule } = webpack;
import { Messages } from "src/types/webpack-common";

async function wrapFilter<T extends ModuleExports>(filter: Filter): Promise<T | null> {
  return (await waitForModule(filter, {
    timeout: Math.max(2_000),
  }).catch(() => null)) as T | null;
}

export const messages = wrapFilter<Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);
