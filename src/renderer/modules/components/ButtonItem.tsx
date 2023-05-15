import type React from "react";
import { Divider, Flex, FormText, Tooltip } from ".";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  look?: string;
  size?: string;
  color?: string;
  borderColor?: string;
  hover?: string;
  fullWidth?: boolean;
  grow?: boolean;
  submitting?: boolean;
  submittingStartedLabel?: string;
  submittingFinishedLabel?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  focusProps?: React.ComponentPropsWithoutRef<"div">;
  innerClassName?: string;
  wrapperClassName?: string;
}

interface Path {
  pathname?: string;
  search?: string;
  hash?: string;
}

interface LinkProps extends Omit<React.ComponentPropsWithoutRef<"a">, "href"> {
  replace?: boolean;
  state?: unknown;
  to: string | Path;
  reloadDocument?: boolean;
  preventScrollReset?: boolean;
  relative?: "route" | "path";
}

interface ButtonLinkProps extends LinkProps {
  look?: string;
  size?: string;
  color?: string;
  borderColor?: string;
  hover?: string;
  fullWidth?: boolean;
  grow?: boolean;
  innerClassName?: string;
}

export type ButtonType = React.ComponentType<React.PropsWithChildren<ButtonProps>> & {
  Link: React.ComponentType<React.PropsWithChildren<ButtonLinkProps>>;
  Looks: Record<"FILLED" | "INVERTED" | "OUTLINED" | "LINK" | "BLANK", string>;
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
  BorderColors: Record<
    | "BRAND"
    | "RED"
    | "GREEN"
    | "YELLOW"
    | "PRIMARY"
    | "LINK"
    | "WHITE"
    | "BLACK"
    | "TRANSPARENT"
    | "BRAND_NEW",
    string
  >;
  Hovers: Record<
    | "DEFAULT"
    | "BRAND"
    | "RED"
    | "GREEN"
    | "YELLOW"
    | "PRIMARY"
    | "LINK"
    | "WHITE"
    | "BLACK"
    | "TRANSPARENT",
    string
  >;
  Sizes: Record<
    "NONE" | "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "XLARGE" | "MIN" | "MAX" | "ICON",
    string
  >;
};

export const Button = (await waitForModule(filters.bySource(".BorderColors=")).then((mod) =>
  getFunctionBySource(mod as ObjectExports, "wrapperClassName"),
)) as ButtonType;

const classes = await waitForModule<
  ObjectExports & Record<"labelRow" | "title" | "note" | "dividerDefault", string>
>(filters.byProps("labelRow", "title", "note", "dividerDefault"));

interface ButtonItemProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  button?: string;
  note?: string;
  tooltipText?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  success?: boolean;
  color?: string;
  disabled?: boolean;
  hideBorder?: boolean;
}

export type ButtonItemType = React.FC<React.PropsWithChildren<ButtonItemProps>>;

export const ButtonItem = (props: React.PropsWithChildren<ButtonItemProps>): React.ReactElement => {
  const { hideBorder = false } = props;

  const button = (
    <Button
      color={props.success ? Button.Colors.GREEN : props.color}
      disabled={props.disabled}
      onClick={props.onClick}>
      {props.button}
    </Button>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <Flex justify={Flex.Justify.END} style={{ opacity: props.disabled ? 0.3 : undefined }}>
        <Flex.Child>
          <div className={classes.labelRow}>
            <label
              className={classes.title}
              style={{ cursor: props.disabled ? "not-allowed" : "pointer" }}>
              {props.children}
            </label>
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
          {props.note && (
            <FormText.DESCRIPTION className={classes.note}>{props.note}</FormText.DESCRIPTION>
          )}
        </Flex.Child>
      </Flex>
      {!hideBorder && <Divider className={classes.dividerDefault} />}
    </div>
  );
};
