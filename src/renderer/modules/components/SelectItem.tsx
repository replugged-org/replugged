import type React from "react";
import { FormItem } from ".";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

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

interface SelectCompProps {
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

type SelectCompType = React.ComponentType<SelectCompProps>;

const selectRgx = /.\.options,.=.\.placeholder/;

const SelectComp = (await waitForModule(filters.bySource(selectRgx)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, selectRgx),
)) as SelectCompType;

interface SelectProps extends SelectCompProps {
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onClear?: () => void;
  value?: string;
  disabled?: boolean;
}

export type SelectType = React.FC<React.PropsWithChildren<SelectProps>> & {
  Looks: typeof Looks;
};

export const Select = ((props) => {
  if (!props.isSelected && props.value != null) props.isSelected = (value) => value === props.value;
  if (!props.serialize) props.serialize = (value) => value;

  return (
    <SelectComp
      isDisabled={props.disabled}
      select={props.onChange || props.onSelect}
      clear={props.onClear}
      {...props}
    />
  );
}) as SelectType;
Select.Looks = Looks;

interface SelectItemProps extends SelectProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

export const SelectItem = (props: React.PropsWithChildren<SelectItemProps>): React.ReactElement => {
  return (
    <FormItem
      title={props.children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      notePosition="after"
      disabled={props.disabled}
      divider>
      <Select {...props} />
    </FormItem>
  );
};
