import { filters, waitForModule } from "../webpack/index";
import { ReactComponent } from "../../../types/util";

type Button = ReactComponent<{
  onClick: () => void;
  look: string;
  size: string;
  color: string;
  disabled: boolean;
}> & {
  DropdownSizes: Record<string, string>;
  Sizes: Record<string, string>;
  Colors: Record<string, string>;
  Looks: Record<string, string>;
};

export default (await waitForModule(filters.bySource('"onDropdownClick"'))) as Button;
