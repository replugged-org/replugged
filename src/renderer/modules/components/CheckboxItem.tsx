import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { Text } from ".";

import type * as Design from "discord-client-types/discord_app/design/web";

const mod = await waitForModule(filters.bySource(".checkboxWrapperDisabled"));

export const Checkbox = getFunctionBySource<Design.Checkbox>(mod, ".checkboxWrapper")!;

export type CheckboxItemType = React.FC<React.PropsWithChildren<Design.CheckboxProps>>;

export function CheckboxItem({
  children,
  style,
  ...props
}: React.PropsWithChildren<Design.CheckboxProps>): React.ReactElement {
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
