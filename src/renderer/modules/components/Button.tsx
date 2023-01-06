import { filters, waitForModule } from "../webpack";
import type { ReactComponent } from "../../../types/util";
import type React from "react";
import { Divider, Flex, FormItem, FormText, Tooltip } from ".";

export type ButtonType = ReactComponent<{
  onClick: () => void;
  look?: string;
  size?: string;
  color?: string;
  disabled?: boolean;
}> & {
  DropdownSizes: Record<string, string>;
  Sizes: Record<string, string>;
  Colors: Record<string, string>;
  Looks: Record<string, string>;
};

const Button = (await waitForModule(filters.bySource('"onDropdownClick"'))) as ButtonType;
export default Button;

const classes = (await waitForModule(filters.byProps("labelRow"))) as Record<string, string>;

type ButtonItemProps = {
  onClick: () => void;
  button: string;
  note?: string;
  tooltipText?: string;
  tooltipPosition?: string;
  success?: boolean;
  color?: string;
  disabled?: boolean;
};

export type ButtonItemType = React.FC<ButtonItemProps>;

export const ButtonItem = (props: React.PropsWithChildren<ButtonItemProps>) => {
  return (
    <div
      className={`${Flex.Direction.VERTICAL} ${Flex.Justify.START} ${Flex.Align.STRETCH} ${Flex.Wrap.NO_WRAP}`}
      style={{ marginBottom: 20 }}>
      <FormItem>
        <div style={{ cursor: "pointer", alignItems: "center", display: "flex" }}>
          <div>
            <div className={classes.labelRow}>
              <label className={classes.title}>{props.children}</label>
            </div>
            <FormText.DESCRIPTION className={classes.note}>{props.note}</FormText.DESCRIPTION>
          </div>
          <Tooltip
            text={props.tooltipText!}
            position={props.tooltipPosition}
            shouldShow={Boolean(props.tooltipText)}>
            {(props_: React.HTMLAttributes<HTMLButtonElement>) => (
              <Button
                {...props_}
                color={props.success ? Button.Colors.GREEN : props.color || Button.Colors.BRAND}
                disabled={props.disabled}
                onClick={() => props.onClick()}
                style={{ marginLeft: 5, position: "absolute", right: "7%" }}>
                {props.button}
              </Button>
            )}
          </Tooltip>
        </div>
        <Divider className={classes.dividerDefault} />
      </FormItem>
    </div>
  );
};
