import { getFunctionBySource } from "@webpack";
import type React from "react";
import { Text } from ".";
import components from "../common/components";

import type { CheckboxProps } from "discord-client-types/discord_app/design/components/Checkbox/web/Checkbox";
import type * as Design from "discord-client-types/discord_app/design/web";

export const Checkbox = getFunctionBySource<Design.Checkbox>(components, ".checkboxWrapper")!;

export type CheckboxItemType = React.FC<React.PropsWithChildren<CheckboxProps>>;

export const CheckboxItem = (props: React.PropsWithChildren<CheckboxProps>): React.ReactElement => {
  return (
    <Checkbox {...props}>
      {props.children && (
        <Text variant="text-sm/normal" style={props.style}>
          {props.children}
        </Text>
      )}
    </Checkbox>
  );
};
