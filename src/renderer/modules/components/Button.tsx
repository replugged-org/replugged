import { filters, waitForModule } from "../webpack";
import type { ReactComponent } from "../../../types/util";
import type React from "react";
import { Divider, Flex, FormText, Tooltip } from ".";
import type { ObjectExports } from "../../../types";

export type ButtonType = ReactComponent<{
  onClick: () => void;
  look?: string;
  size?: string;
  color?: string;
  disabled?: boolean;
}> & {
  DropdownSizes: Record<"SMALL" | "MEDIUM" | "LARGE", string>;
  Sizes: Record<
    "NONE" | "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "XLARGE" | "MIN" | "MAX" | "ICON",
    string
  >;
  Colors: Record<
    | "BRAND"
    | "RED"
    | "GREEN"
    | "YELLOW"
    | "PRIMARY"
    | "LINK"
    | "WHITE"
    | "BLACK"
    | "TRANSPARENT"
    | "BRAND_NEW"
    | "CUSTOM",
    string
  >;
  Looks: Record<"FILLED" | "INVERTED" | "OUTLINED" | "LINK" | "BLANK", string>;
};

export const Button = (await waitForModule(filters.bySource('"dropdownSize"'))) as ButtonType;

const classes = await waitForModule<
  ObjectExports & Record<"labelRow" | "title" | "note" | "dividerDefault", string>
>(filters.byProps("labelRow", "title", "note", "dividerDefault"));
interface ButtonItemProps {
  onClick: () => void;
  button: string;
  note?: string;
  tooltipText?: string;
  tooltipPosition?: string;
  success?: boolean;
  color?: string;
  disabled?: boolean;
}

export type ButtonItemType = React.FC<React.PropsWithChildren<ButtonItemProps>>;

export const ButtonItem = (props: React.PropsWithChildren<ButtonItemProps>): React.ReactElement => {
  const button = (
    <Button
      color={props.success ? Button.Colors.GREEN : props.color || Button.Colors.BRAND}
      disabled={props.disabled}
      onClick={() => props.onClick()}>
      {props.button}
    </Button>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <Flex justify={Flex.Justify.END}>
        <Flex.Child>
          <div className={classes.labelRow}>
            <label className={classes.title}>{props.children}</label>
            {props.tooltipText ? (
              <Tooltip
                text={props.tooltipText}
                position={props.tooltipPosition}
                shouldShow={Boolean(props.tooltipText)}
                className={Flex.Align.CENTER}
                style={{ height: "100%" }}>
                {button}
              </Tooltip>
            ) : (
              button
            )}
          </div>
          <FormText.DESCRIPTION className={classes.note}>{props.note}</FormText.DESCRIPTION>
        </Flex.Child>
      </Flex>
      <Divider className={classes.dividerDefault} />
    </div>
  );
};
