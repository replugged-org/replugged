import type React from "react";
import { Divider, Flex, FormText, Tooltip } from ".";
import components from "../common/components";
import { waitForProps } from "../webpack";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  look?: string;
  color?: string;
  size?: string;
  fullWidth?: boolean;
  grow?: boolean;
  submitting?: boolean;
  wrapperClassName?: string;
  innerClassName?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  focusProps?: Record<string, unknown>;
  submittingStartedLabel?: string;
  submittingFinishedLabel?: string;
}

interface Location<S = unknown> {
  pathname?: string;
  search?: string;
  state?: S;
  hash?: string;
  key?: string;
}

interface LinkProps<S = unknown> extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  component?: React.ComponentType;
  to: string | Location<S> | ((location: Location<S>) => string | Location<S>);
  replace?: boolean;
  innerRef?: React.Ref<HTMLAnchorElement>;
}

interface ButtonLinkProps<S = unknown> extends LinkProps<S> {
  look?: string;
  color?: string;
  size?: string;
  fullWidth?: boolean;
  grow?: boolean;
  innerClassName?: string;
}

export type ButtonType = React.FC<React.PropsWithChildren<ButtonProps>> & {
  Link: React.FC<React.PropsWithChildren<ButtonLinkProps>>;
  Looks: Record<"FILLED" | "OUTLINED" | "LINK" | "BLANK", string>;
  Colors: Record<
    | "BRAND"
    | "BRAND_INVERTED"
    | "RED"
    | "GREEN"
    | "PRIMARY"
    | "LINK"
    | "WHITE"
    | "TRANSPARENT"
    | "CUSTOM",
    string
  >;
  Sizes: Record<"NONE" | "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "MIN" | "MAX" | "ICON", string>;
};

export const { Button } = components;

const classes =
  await waitForProps<Record<"dividerDefault" | "labelRow" | "note" | "title", string>>(
    "dividerDefault",
  );

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
