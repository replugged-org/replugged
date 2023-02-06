import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";
import { FormItem } from ".";

interface RadioOptionType {
  name: string;
  value: string;
  desc?: string;
  disabled?: boolean;
  color?: string;
  tooltipText?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center";
}

interface RadioProps {
  options: RadioOptionType[];
  value?: string;
  onChange: (e: RadioOptionType) => void;
  disabled?: boolean;
  size?: string;
  radioPosition?: "left" | "right";
  withTransparentBackground?: boolean;
  style?: React.CSSProperties;
  className?: string;
  itemInfoClassName?: string;
  itemTitleClassName?: string;
  radioItemClassName?: string;
}

export type RadioType = React.ComponentType<RadioProps> & {
  Sizes: Record<"NOT_SET" | "NONE" | "SMALL" | "MEDIUM", string>;
};

const radioStr = ".itemInfoClassName";

export const Radio = (await waitForModule(filters.bySource(radioStr)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, radioStr),
)) as RadioType;

interface RadioItemProps extends RadioProps {
  note?: string;
}

export type RadioItemType = React.FC<React.PropsWithChildren<RadioItemProps>>;

export const RadioItem = (props: React.PropsWithChildren<RadioItemProps>): React.ReactElement => {
  return (
    <FormItem
      title={props.children}
      style={{ marginBottom: 20 }}
      note={props.note}
      notePosition="before"
      divider>
      <Radio {...props}></Radio>
    </FormItem>
  );
};
