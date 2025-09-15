import { classNames, marginStyles } from "@common";
import { filters, getFunctionBySource, waitForModule, waitForProps } from "@webpack";
import type React from "react";
import { Divider, Flex, FormText } from ".";

import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";
import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";

import "./ButtonItem.css";

const mod = await waitForModule(filters.bySource(".disabledButtonWrapper,"));
export const Button = getFunctionBySource<VoidDesign.Button>(mod, "Type.PULSING_ELLIPSIS")!;

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

interface ButtonItemProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  button?: React.ReactNode;
  note?: string;
  success?: boolean;
  color?: string;
  disabled?: boolean;
  hideBorder?: boolean;
}

export type ButtonItemType = React.FC<React.PropsWithChildren<ButtonItemProps>>;

export function ButtonItem({
  children,
  button,
  color,
  success,
  disabled,
  onClick,
  note,
  hideBorder = false,
}: React.PropsWithChildren<ButtonItemProps>): React.ReactElement {
  return (
    <div
      className={classNames(marginStyles.marginBottom20, {
        [classes.disabled]: disabled,
      })}>
      <Flex direction={Flex.Direction.VERTICAL} className="replugged-button-item-wrapper">
        <Flex direction={Flex.Direction.VERTICAL} className="replugged-button-item-labelSection">
          <Flex align={Flex.Align.CENTER} direction={Flex.Direction.HORIZONTAL}>
            <label className={classes.title}>{children}</label>
          </Flex>
          {note && (
            <FormText.DESCRIPTION
              className={classNames({ "replugged-button-item-disabled": disabled })}>
              {note}
            </FormText.DESCRIPTION>
          )}
        </Flex>
        <Flex>
          <Button
            color={success ? Button.Colors.GREEN : color}
            disabled={disabled}
            onClick={onClick}>
            {button}
          </Button>
        </Flex>
      </Flex>
      {!hideBorder && <Divider className={classes.dividerDefault} />}
    </div>
  );
}
