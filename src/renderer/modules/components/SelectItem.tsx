import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";
import { FormItem } from ".";

interface SelectOptionType {
  label: string;
  value: string;
  disabled?: boolean;
  key?: string;
}

interface SelectCompProps {
  options: SelectOptionType[];
  isSelected?: (e: string) => void;
  serialize?: (e: string) => void;
  select?: (e: string) => void;
  clear?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
  maxVisibleItems?: number;
  autoFocus?: boolean;
  popoutWidth?: number;
  clearable?: boolean;
  look?: number;
  popoutPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  closeOnSelect?: boolean;
  hideIcon?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  renderOptionLabel?: (e: SelectOptionType) => void;
  renderOptionValue?: (e: SelectOptionType[]) => void;
  className?: string;
  popoutClassName?: string;
  optionClassName?: string;
}

type SelectCompType = React.ComponentType<SelectCompProps>;

const selectRgx = /.\.options,.=.\.placeholder/;

const SelectComp = (await waitForModule(filters.bySource(selectRgx)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, selectRgx),
)) as SelectCompType;

export interface SelectProps extends SelectCompProps {
  onChange?: (e: string) => void;
  onSelect?: (e: string) => void;
  onClear?: () => void;
  value?: string;
  disabled?: boolean;
}

export type SelectType = React.FC<React.PropsWithChildren<SelectProps>>;

export const Select = ((props) => {
  if (!props.isSelected && props.value != null) props.isSelected = (e) => e === props.value;
  if (!props.serialize) props.serialize = (e) => e;

  return (
    <SelectComp
      isDisabled={props.disabled}
      select={props.onChange || props.onSelect}
      clear={props.onClear}
      {...props}
    />
  );
}) as SelectType;

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
      divider>
      <Select {...props} />
    </FormItem>
  );
};
