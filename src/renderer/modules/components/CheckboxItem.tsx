import type React from "react";
import { Text } from ".";
import { filters, waitForModule } from "../webpack";

interface CheckboxProps {
  disabled?: boolean;
  readOnly?: boolean;
  reverse?: boolean;
  displayOnly?: boolean;
  shape?: string;
  align?: string;
  type?: string;
  color?: string;
  checkboxColor?: string;
  size?: number;
  value?: boolean;
  style?: React.CSSProperties;
  className?: string;
  innerClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, state: boolean) => void;
}

export type CheckboxType = React.FC<React.PropsWithChildren<CheckboxProps>> & {
  defaultProps: CheckboxProps;
  Types: Record<"DEFAULT" | "INVERTED" | "GHOST" | "ROW", string>;
  Aligns: Record<"TOP" | "CENTER", string>;
  Shapes: Record<"BOX" | "ROUND" | "SMALL_BOX", string>;
};

export type CheckboxItemType = React.FC<React.PropsWithChildren<CheckboxProps>>;

export const Checkbox = (await waitForModule(filters.bySource(".getInputMode")).then((mod) =>
  Object.values(mod).find((x) => "defaultProps" in x && "displayOnly" in x.defaultProps),
)) as CheckboxType;

export const CheckboxItem = (props: React.PropsWithChildren<CheckboxProps>): React.ReactElement => {
  return (
    <Checkbox {...props}>
      {props.children && (
        <Text variant="text-sm/normal" style={props.style}>
          {props.children}
        </Text>
      )}
    </Checkbox>
  );
};
