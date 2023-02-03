import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface SelectOptionType {
  label: string;
  value: string | number;
  disabled?: boolean;
  key?: string;
}

interface SelectCompProps {
  options: SelectOptionType[];
  isSelected?: (e: string | number) => void;
  serialize?: (e: string | number) => void;
  select?: (e: string | number) => void;
  clear?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
  maxVisibleItems?: number;
  autoFocus?: boolean;
  popoutWidth?: number;
  clearable?: boolean;
  look?: number;
  popoutPosition?: "top" | "bottom" | "left" | "right" | "center";
  closeOnSelect?: boolean;
  hideIcon?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  renderOptionLabel?: (e: SelectOptionType) => void;
  renderOptionValue?: (e: SelectOptionType[]) => void;
  style?: React.CSSProperties;
  className?: string;
  popoutClassName?: string;
  optionClassName?: string;
}

type SelectCompType = React.ComponentType<SelectCompProps>;

const selectRgx = /.\.options,.=.\.placeholder/;

const Select = (await waitForModule(filters.bySource(selectRgx)).then((mod) =>
  getFunctionBySource(selectRgx, mod as ObjectExports),
)) as SelectCompType;

export interface SelectProps extends SelectCompProps {
  onChange?: (e: string | number) => void;
  onSelect?: (e: string | number) => void;
  onClear?: () => void;
  value?: string | number;
  disabled?: boolean;
}

export type SelectType = React.FC<React.PropsWithChildren<SelectProps>>;

export default ((props) => {
  if (!props.isSelected && props.value != null) props.isSelected = (e) => e === props.value;
  if (!props.serialize) props.serialize = (e) => e;

  return (
    <Select
      isDisabled={props.disabled}
      select={props.onChange || props.onSelect}
      clear={props.onClear}
      {...props}></Select>
  );
}) as SelectType;
