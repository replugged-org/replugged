import type { ObjectExports } from "src/types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

export type DividerType = React.ComponentType<React.HTMLProps<{}>>;

const rgx = /\.divider,.\),style:./;

export default (await waitForModule(filters.bySource(rgx)).then((mod) => {
  if (typeof mod === "function") return mod;
  return getFunctionBySource(rgx, mod as ObjectExports);
})) as DividerType;
