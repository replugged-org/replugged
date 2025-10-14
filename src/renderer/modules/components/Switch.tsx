import { getFunctionBySource } from "@webpack";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const Switch = getFunctionBySource<Design.Switch>(components, /{switchIconsEnabled:\i}=\i\.use/)!;

type CustomSwitchProps = Design.SwitchProps & {
  value?: boolean;
};

export type CustomSwitchType = React.FC<CustomSwitchProps>;

function CustomSwitch({ value, ...props }: CustomSwitchProps): React.ReactElement {
  return <Switch checked={value} {...props} />;
}

export default CustomSwitch;
