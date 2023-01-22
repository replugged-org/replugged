import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

const mod = await waitForModule(filters.bySource("=/^((?:rgb|hsl)a?)\\s*\\(([^)]*)\\)/i;"));
const FormItemComp = getFunctionBySource("FocusRing", mod as ObjectExports) as ReactComponent<{
  children: React.ReactNode;
}>;

export type FormItemType = ReactComponent<{
  children: React.ReactNode;
}>;
// Fragment because FormItem can only have one child.
export default ((props) => (
  <FormItemComp {...props}>
    <>{props.children}</>
  </FormItemComp>
)) as FormItemType;
