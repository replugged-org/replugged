import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const switchRegex = /{switchIconsEnabled:\i}=\i\.use/;
const mod = await waitForModule(filters.bySource(switchRegex));

const Switch = getFunctionBySource<Design.Switch>(mod, switchRegex)!;

type CustomSwitchProps = Design.SwitchProps & {
  value?: boolean;
};

export type CustomSwitchType = React.FC<CustomSwitchProps>;

function CustomSwitch({ value, ...props }: CustomSwitchProps): React.ReactElement {
  return <Switch checked={value} {...props} />;
}

export default CustomSwitch;
