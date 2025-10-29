import { webpack } from "@replugged";
import { components } from "@common";

export default webpack.getComponentBySource<React.FC>(
  components,
  "M21 2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 1 1 0-2h3.93A8",
)!;
