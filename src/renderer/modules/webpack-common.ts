import { Filter, ModuleExports, webpack } from "@replugged";
import { Messages } from "src/types/webpack-common";
const { filters, waitForModule } = webpack;

async function wrapFilter<T extends ModuleExports>(filter: Filter): Promise<T | null> {
  return (await waitForModule(filter, {
    timeout: Math.max(2_000),
  }).catch(() => null)) as T | null;
}

// todo: figure out how to await this without blocking the modules from loading
export const messages = wrapFilter<Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);
