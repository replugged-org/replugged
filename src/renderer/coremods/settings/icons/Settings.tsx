import { webpack } from "@replugged";
import { components } from "@common";

export default webpack.getComponentBySource<React.FC>(
  components,
  "11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
)!;
