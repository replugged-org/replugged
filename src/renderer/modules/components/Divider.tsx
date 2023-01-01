import { filters, waitForModule } from "../webpack";

const Divider = (await waitForModule(
  filters.bySource(/\.divider,.\),style:./),
)) as React.ComponentType<React.HTMLProps<{}>>;

export default Divider;
