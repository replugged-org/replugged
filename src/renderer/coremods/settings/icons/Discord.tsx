import { webpack } from "@replugged";
import { components } from "@common";

export default webpack.getComponentBySource<React.FC>(
  components,
  "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.2",
)!;
