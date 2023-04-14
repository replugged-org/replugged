import type React from "react";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

export type DividerType = React.ComponentType<React.HTMLProps<Record<string, never>>>;

const rgx = /\.divider,.\),style:./;

export default await waitForModule(filters.bySource(rgx)).then((mod) => {
  if (typeof mod === "function") return mod as DividerType;
  return getFunctionBySource<DividerType>(mod, rgx)!;
});
