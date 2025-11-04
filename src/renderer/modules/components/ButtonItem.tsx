import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { FormControl } from ".";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";
import type * as Design from "discord-client-types/discord_app/design/web";

import "./ButtonItem.css";

const buttonString = ".disabledButtonWrapper,";
const mod = await waitForModule(filters.bySource(buttonString));

// TODO: Replace with Button from Mana Design System
export const Button = getFunctionBySource<VoidDesign.Button>(mod, buttonString)!;

interface ButtonItemProps extends Omit<Design.FormControlProps, "layout" | "children"> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  button?: React.ReactNode;
  color?: string;
}

export type ButtonItemType = React.FC<React.PropsWithChildren<ButtonItemProps>>;

export function ButtonItem({
  button,
  color,
  disabled,
  onClick,
  ...props
}: React.PropsWithChildren<ButtonItemProps>): React.ReactElement {
  return (
    <FormControl disabled={disabled} layout="horizontal" {...props}>
      <Button color={color} disabled={disabled} onClick={onClick}>
        {button}
      </Button>
    </FormControl>
  );
}
