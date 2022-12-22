import { filters, waitForModule } from "../webpack";
import React from "../webpack/common/react";

const Divider = (await waitForModule(
  filters.bySource(/\.divider,.\),style:./),
)) as React.ComponentType<React.HTMLProps<{}>>;

export default Divider;
