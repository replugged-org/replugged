import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";
import { Divider, FormItem, FormText, Text } from ".";

interface RadioOptionType {
  name: string;
  value: string | number;
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
  getFunctionBySource(radioStr, mod as ObjectExports),
)) as RadioType;

const classes = await waitForModule<Record<"dividerDefault", string>>(filters.byProps("labelRow"));

interface RadioItemProps extends RadioProps {
  note?: string;
}

export type RadioItemType = React.FC<React.PropsWithChildren<RadioItemProps>>;

export const RadioItem = (props: React.PropsWithChildren<RadioItemProps>): React.ReactElement => {
  return (
    <div style={{ marginBottom: 20 }}>
      <FormItem>
        <Text.Eyebrow style={{ marginBottom: 8 }}>{props.children}</Text.Eyebrow>
        <FormText.DESCRIPTION style={{ marginBottom: 8 }}>{props.note}</FormText.DESCRIPTION>
        <Radio {...props}></Radio>
        <Divider className={classes.dividerDefault} />
      </FormItem>
    </div>
  );
};
