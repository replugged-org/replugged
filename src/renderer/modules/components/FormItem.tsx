import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

const mod = (await waitForModule(
  filters.bySource("=/^((?:rgb|hsl)a?)\\s*\\(([^)]*)\\)/i;"),
)) as ObjectExports;
const FormItemComp = getFunctionBySource("FocusRing", mod) as ReactComponent<{}>;

// Fragment because FormItem can only have one child.
const FormItem: ReactComponent<{}> = (props) => (
  <FormItemComp {...props}>
    <>{props.children}</>
  </FormItemComp>
);

export default FormItem;
