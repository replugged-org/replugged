import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { Text } from ".";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";

const checkboxString = ".checkboxWrapperDisabled";
const mod = await waitForModule(filters.bySource(checkboxString));

export type CustomCheckboxType = VoidDesign.Checkbox & {
  Types: VoidDesign.CheckboxTypes;
  Aligns: VoidDesign.CheckboxAligns;
  Shapes: VoidDesign.CheckboxShapes;
};

export const Checkbox = getFunctionBySource<CustomCheckboxType>(mod, checkboxString)!;

Checkbox.Types = getExportsForProps(mod, ["DEFAULT"])!;
Checkbox.Aligns = getExportsForProps(mod, ["TOP"])!;
Checkbox.Shapes = getExportsForProps(mod, ["BOX"])!;

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
