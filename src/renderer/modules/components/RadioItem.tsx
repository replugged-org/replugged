import { sharedStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type { RadioGroupProps } from "discord-client-types/discord_app/design/components/RadioGroup/web/RadioGroup";
import type * as Design from "discord-client-types/discord_app/design/web";

export const RadioGroup = getFunctionBySource<Design.RadioGroup>(components, "itemInfoClassName:")!;

interface RadioItemProps extends RadioGroupProps {
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
      className={sharedStyles.MarginStyles.marginBottom20}
      style={style}
      note={note}
      disabled={restProps.disabled}
      divider>
      <RadioGroup {...restProps} />
    </FormItem>
  );
}
