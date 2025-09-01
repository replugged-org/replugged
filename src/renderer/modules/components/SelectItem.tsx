import { sharedStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

const Looks = {
  FILLED: 0,
  CUSTOM: 1,
} as const;

interface SelectOptionType {
  label: string;
  value: string;
  disabled?: boolean;
  key?: string;
}

interface SelectProps {
  options: SelectOptionType[];
  isSelected?: (value: string) => void;
  serialize?: (value: string) => void;
  select?: (value: string) => void;
  clear?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
  maxVisibleItems?: number;
  autoFocus?: boolean;
  popoutWidth?: number;
  clearable?: boolean;
  look?: (typeof Looks)[keyof typeof Looks];
  popoutPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  closeOnSelect?: boolean;
  hideIcon?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  renderOptionLabel?: (option: SelectOptionType) => string;
  renderOptionValue?: (option: SelectOptionType[]) => string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  popoutClassName?: string;
  optionClassName?: string;
}

export type SelectType = React.FC<SelectProps>;

const Select = getFunctionBySource<SelectType>(components, /maxVisibleItems:\w+=7/)!;

interface CustomSelectProps extends SelectProps {
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onClear?: () => void;
  value?: string;
  disabled?: boolean;
}

export type CustomSelectType = React.FC<React.PropsWithChildren<CustomSelectProps>> & {
  Looks: typeof Looks;
};

export function CustomSelect(props: CustomSelectProps): React.ReactElement {
  if (!props.isSelected && props.value != null) props.isSelected = (value) => value === props.value;
  if (!props.serialize) props.serialize = (value) => value;

  return (
    <Select
      isDisabled={props.disabled}
      select={props.onChange || props.onSelect}
      clear={props.onClear}
      {...props}
    />
  );
}
CustomSelect.Looks = Looks;

interface SelectItemProps extends CustomSelectProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

export function SelectItem({
  children,
  style,
  note,
  ...restProps
}: React.PropsWithChildren<SelectItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={sharedStyles.MarginStyles.marginBottom20}
      style={style}
      note={note}
      notePosition="after"
      disabled={restProps.disabled}
      divider>
      <CustomSelect {...restProps} />
    </FormItem>
  );
}
