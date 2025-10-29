import { webpack } from "@replugged";
import { components } from "@common";

export default webpack.getComponentBySource<React.FC>(
  components,
  "M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0",
)!;
