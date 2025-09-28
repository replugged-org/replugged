import { marginStyles } from "@common";
import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { FormItem } from ".";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";

const mod = await waitForModule(filters.bySource(".radioIndicatorGroup,"));

export const RadioGroup = getFunctionBySource<VoidDesign.RadioGroup>(
  mod,
  /description:\i,required:\i/,
)!;

interface RadioItemProps extends VoidDesign.RadioGroupProps {
  note?: string;
  style?: React.CSSProperties;
}

export type RadioItemType = React.FC<React.PropsWithChildren<RadioItemProps>>;

export function RadioItem({
  children,
  style,
  note,
  ...props
}: React.PropsWithChildren<RadioItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      disabled={props.disabled}
      divider>
      <RadioGroup {...props} />
    </FormItem>
  );
}
