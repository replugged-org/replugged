import { sharedStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const SingleSelect = getFunctionBySource<Design.SingleSelect>(
  components,
  /var{value:\w+,onChange:\w+}/,
)!;

interface CustomSelectProps extends Design.SingleSelectProps {
  disabled?: boolean;
}

export type CustomSelectType = React.FC<React.PropsWithChildren<CustomSelectProps>>;

export function CustomSelect({ disabled, ...props }: CustomSelectProps): React.ReactElement {
  return <SingleSelect isDisabled={disabled} {...props} />;
}

interface SelectItemProps extends CustomSelectProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

export function SelectItem({
  children,
  style,
  note,
  ...restProps
}: React.PropsWithChildren<SelectItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={sharedStyles.MarginStyles.marginBottom20}
      style={style}
      note={note}
      notePosition="after"
      disabled={restProps.disabled}
      divider>
      <CustomSelect {...restProps} />
    </FormItem>
  );
}
