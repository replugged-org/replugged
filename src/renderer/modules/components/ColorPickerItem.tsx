import { marginStyles } from "@common";
import { getComponentBySource } from "@webpack";
import { Flex, FormItem } from ".";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

export const CustomColorPicker = getComponentBySource<Design.CustomColorPicker>(
  components,
  ".customColorPicker",
)!;

interface ColorPickerItemProps
  extends Omit<Design.CustomColorPickerProps, "onChange" | "wrapperComponentType"> {
  disabled?: boolean;
  getHex?: boolean;
  onChange?: (color: string | number) => void;
  note?: string;
  style?: React.CSSProperties;
}

export type ColorPickerItemType = React.FC<React.PropsWithChildren<ColorPickerItemProps>>;

function ColorPickerItem({
  onChange,
  getHex,
  children,
  style,
  note,
  disabled,
  ...props
}: React.PropsWithChildren<ColorPickerItemProps>): React.ReactElement {
  return (
    <CustomColorPicker
      {...props}
      onChange={(int: number) => {
        if (!getHex) return onChange?.(int);
        return onChange?.(`#${BigInt(int).toString(16)}`);
      }}
      wrapperComponentType={(wrapperProps) => (
        <FormItem
          {...wrapperProps}
          title={children}
          className={marginStyles.marginBottom20}
          style={style}
          note={note}
          notePosition="after"
          disabled={disabled}
          divider>
          <Flex direction={Flex.Direction.VERTICAL} style={{ gap: "16px", paddingTop: "16px" }}>
            {wrapperProps.children}
          </Flex>
        </FormItem>
      )}
    />
  );
}

export default ColorPickerItem;
