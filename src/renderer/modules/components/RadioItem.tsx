import { marginStyles } from "@common";
import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import { FormItem } from ".";

import type * as Design from "discord-client-types/discord_app/design/web";

const radioString = ".radioIndicatorGroup,";
const mod = await waitForModule(filters.bySource(radioString));

export const RadioGroup = getFunctionBySource<Design.RadioGroup>(mod, radioString)!;

interface RadioItemProps extends Design.RadioGroupProps {
  note?: string;
  style?: React.CSSProperties;
}

export type RadioItemType = React.FC<React.PropsWithChildren<RadioItemProps>>;

export function RadioItem({
  children,
  className,
  style,
  note,
  ...restProps
}: React.PropsWithChildren<RadioItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      disabled={restProps.disabled}
      divider>
      <RadioGroup {...restProps} />
    </FormItem>
  );
}
