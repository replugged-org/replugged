import type React from "react";
import { Flex, FormItem } from ".";
import components from "../common/components";
import { getComponentBySource } from "@webpack";

interface ColorPickerProps {
  value: string | number;
  suggestedColors?: string[] | number[];
  middle?: React.ReactNode;
  footer?: React.ReactNode;
  showEyeDropper?: boolean;
  className?: string;
  onClose?: () => void;
  eagerUpdate?: boolean;
  wrapperComponentType?: React.FC<{
    "aria-label": string;
    className: string;
    children: React.ReactElement;
  }>;
  onChange?: (color: number) => void;
}

export type ColorPickerType = React.MemoExoticComponent<React.FC<ColorPickerProps>>;

export const ColorPicker = getComponentBySource<ColorPickerType>(components, ".customColorPicker")!;

interface ColorPickerItemProps extends ColorPickerProps {
  eagerUpdate?: never;
  wrapperComponentType?: never;
  disabled?: boolean;
  getHex?: boolean;
  onChange?: (color: string | number) => void;
  note?: string;
  style?: React.CSSProperties;
}

export type ColorPickerItemType = React.FC<React.PropsWithChildren<ColorPickerItemProps>>;

export const ColorPickerItem = ({
  onChange,
  ...props
}: React.PropsWithChildren<ColorPickerItemProps>): React.ReactElement => {
  return (
    <ColorPicker
      {...props}
      onChange={(int: number) => {
        if (!props.getHex) return onChange?.(int);
        return onChange?.(`#${BigInt(int).toString(16)}`);
      }}
      wrapperComponentType={({ className, children, ...innerProps }) => (
        <FormItem
          {...innerProps}
          title={props.children}
          style={{ marginBottom: 20, ...props.style }}
          note={props.note}
          notePosition="after"
          disabled={props.disabled}
          divider>
          <Flex direction={Flex.Direction.VERTICAL} style={{ gap: "16px", paddingTop: "16px" }}>
            {children}
          </Flex>
        </FormItem>
      )}
    />
  );
};
