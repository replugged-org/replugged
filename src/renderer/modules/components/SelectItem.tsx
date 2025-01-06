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

export type SelectCompType = React.FC<SelectCompProps>;

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

interface SelectItemProps extends SelectProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

const getSelectItem = async (): Promise<{
  SelectItem: SelectItemType;
  Select: SelectType;
}> => {
  const SelectComp = (await components).Select;

  const Select = ((props) => {
    if (!props.isSelected && props.value != null)
      props.isSelected = (value) => value === props.value;
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

  const SelectItem = (props: React.PropsWithChildren<SelectItemProps>): React.ReactElement => {
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

  return { Select, SelectItem };
};

export default getSelectItem();
