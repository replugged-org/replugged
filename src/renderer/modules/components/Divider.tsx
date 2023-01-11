import { filters, waitForModule } from "../webpack";

export type DividerType = React.ComponentType<React.HTMLProps<{}>>;

export default (await waitForModule(filters.bySource(/\.divider,.\),style:./))) as DividerType;
