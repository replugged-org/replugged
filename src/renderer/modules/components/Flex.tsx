import { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

type Flex = ReactComponent<{
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  shrink?: number;
  grow?: number;
  basis?: string;
}> & {
  Direction: Record<string, string>;
  Justify: Record<string, string>;
  Align: Record<string, string>;
  Wrap: Record<string, string>;
};

const mod = await waitForModule(filters.bySource("HORIZONTAL_REVERSE:"));

export default mod as Flex;
