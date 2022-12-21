import { ModuleExports, ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type SwitchItem = ModuleExports & ReactComponent<{
  note?: string;
  value: boolean;
  onChange: () => void;
}>;

export const SwitchItem = await waitForModule<SwitchItem>(filters.bySource(/=.\.helpdeskArticleId,.=.\.children/));
