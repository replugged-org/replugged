import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";
import { Divider, FormItem, FormText, Text } from ".";

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

const SelectComp = (await waitForModule(filters.bySource(selectRgx)).then((mod) =>
  getFunctionBySource(selectRgx, mod as ObjectExports),
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
      {...props}></SelectComp>
  );
}) as SelectType;

const classes = await waitForModule<Record<"dividerDefault", string>>(filters.byProps("labelRow"));

interface SelectItemProps extends SelectProps {
  note?: string;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

export const SelectItem = (props: React.PropsWithChildren<SelectItemProps>): React.ReactElement => {
  return (
    <div style={{ marginBottom: 20 }}>
      <FormItem>
        <Text.Eyebrow style={{ marginBottom: 8 }}>{props.children}</Text.Eyebrow>
        <Select {...props}></Select>
        <FormText.DESCRIPTION style={{ marginTop: 8 }}>{props.note}</FormText.DESCRIPTION>
        <Divider className={classes.dividerDefault} />
      </FormItem>
    </div>
  );
};
