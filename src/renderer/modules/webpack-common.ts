import { Filter, ModuleExports, webpack } from "@replugged";
import { Messages } from "src/types/webpack-common";
const { filters, waitForModule } = webpack;

const start = Date.now();

async function wrapFilter<T extends ModuleExports>(filter: Filter): Promise<T | null> {
  return (await waitForModule(filter, {
    timeout: Math.max(2_000 - (start - Date.now()), 0),
  }).catch(() => null)) as T | null;
}

export const messages = await wrapFilter<Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);
