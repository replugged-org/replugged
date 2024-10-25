import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RadioOptionType = {
  name: string;
  value: string;
  desc?: string;
  disabled?: boolean;
  color?: string;
  tooltipText?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  icon?: React.ComponentType<unknown>;
  collapsibleContent?: React.ReactNode;
  radioItemIconClassName?: string;
  radioBarClassName?: string;
};

interface RadioProps {
  options: RadioOptionType[];
  value?: string;
  onChange: (option: RadioOptionType) => void;
  disabled?: boolean;
  size?: string;
  radioPosition?: "left" | "right";
  withTransparentBackground?: boolean;
  orientation?: "vertical" | "horizontal";
  "aria-labelledby"?: string;
  className?: string;
  itemInfoClassName?: string;
  itemTitleClassName?: string;
  radioItemClassName?: string;
  collapsibleClassName?: string;
}

export type RadioType = React.FC<RadioProps> & {
  Sizes: Record<"NOT_SET" | "NONE" | "SMALL" | "MEDIUM", string>;
};

export const Radio = components.RadioGroup;

interface RadioItemProps extends RadioProps {
  note?: string;
  style?: React.CSSProperties;
}

export type RadioItemType = React.FC<React.PropsWithChildren<RadioItemProps>>;

export const RadioItem = (props: React.PropsWithChildren<RadioItemProps>): React.ReactElement => {
  return (
    <FormItem
      title={props.children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      disabled={props.disabled}
      divider>
      <Radio {...props} />
    </FormItem>
  );
};
