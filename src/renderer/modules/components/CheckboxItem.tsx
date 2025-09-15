import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { Text } from ".";

import type * as VoidDesign from "discord-client-types/discord_app/design/web";

const checkboxString = ".checkboxWrapperDisabled";
const mod = await waitForModule(filters.bySource(checkboxString));

export const Checkbox = getFunctionBySource<VoidDesign.Checkbox>(mod, checkboxString)!;

export type CheckboxItemType = React.FC<React.PropsWithChildren<VoidDesign.CheckboxProps>>;

export function CheckboxItem({
  children,
  style,
  ...props
}: React.PropsWithChildren<VoidDesign.CheckboxProps>): React.ReactElement {
  return (
    <Checkbox {...props}>
      {children && (
        <Text variant="text-sm/normal" style={style}>
          {children}
        </Text>
      )}
    </Checkbox>
  );
}
