import { filters, getFunctionBySource, waitForModule, waitForProps } from "@webpack";
import type React from "react";
import { Divider, Flex, FormText, Tooltip } from ".";

import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";
import type * as Design from "discord-client-types/discord_app/design/web";

const mod = await waitForModule(filters.bySource(".disabledButtonWrapper,"));
export const Button = getFunctionBySource<Design.Button>(mod, "Type.PULSING_ELLIPSIS")!;

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

interface ButtonItemProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  button?: React.ReactNode;
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
