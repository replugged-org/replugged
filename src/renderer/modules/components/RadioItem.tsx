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

export const RadioItem = (props: React.PropsWithChildren<RadioItemProps>): React.ReactElement => {
  return (
    <FormItem
      title={props.children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      disabled={props.disabled}
      divider>
      <RadioGroup {...props} />
    </FormItem>
  );
};
