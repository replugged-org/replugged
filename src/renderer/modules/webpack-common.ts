import { Filter, ModuleExports } from "@replugged";
import { filters, waitForModule } from "./webpack";
import { Messages } from "src/types/webpack-common";

async function wrapFilter<T extends ModuleExports>(filter: Filter): Promise<T | null> {
  return (await waitForModule(filter, {
    timeout: Math.max(2_000),
  }).catch(() => null)) as T | null;
}

export const messages = wrapFilter<Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);
