import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

import type * as Design from "discord-client-types/discord_app/design/web";

const checkboxRegex = /labelType:\i="primary",description:/;
const mod = await waitForModule(filters.bySource(checkboxRegex));

const Checkbox = getFunctionBySource<Design.Checkbox>(mod, "mana-toggle-inputs")!;

type CustomCheckboxProps = Design.CheckboxProps & {
  value?: boolean;
};

export type CustomCheckboxType = React.FC<CustomCheckboxProps>;

function CustomCheckbox({ value, ...props }: CustomCheckboxProps): React.ReactElement {
  return <Checkbox checked={value} {...props} />;
}

export default CustomCheckbox;
