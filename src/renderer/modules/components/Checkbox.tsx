import type React from "react";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const { Checkbox } = components;

type CustomCheckboxProps = Design.CheckboxProps & {
  value?: boolean;
};

export type CustomCheckboxType = React.FC<CustomCheckboxProps>;

function CustomCheckbox({ value, ...props }: CustomCheckboxProps): React.ReactElement {
  return <Checkbox checked={value} {...props} />;
}

export default CustomCheckbox;
