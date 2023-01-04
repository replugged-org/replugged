import { filters, waitForModule } from "../webpack";

export type DividerType = React.ComponentType<React.HTMLProps<{}>>;

const Divider = (await waitForModule(filters.bySource(/\.divider,.\),style:./))) as DividerType;

export default Divider;
