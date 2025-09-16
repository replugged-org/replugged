import { marginStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const SingleSelect = getFunctionBySource<Design.SingleSelect>(
  components,
  /var{value:\i,onChange:\i}/,
)!;

interface CustomSingleSelectProps extends Design.SingleSelectProps {
  disabled?: boolean;
}

export type CustomSingleSelectType = React.FC<React.PropsWithChildren<CustomSingleSelectProps>>;

export function CustomSingleSelect({
  disabled,
  ...props
}: CustomSingleSelectProps): React.ReactElement {
  return <SingleSelect isDisabled={disabled} {...props} />;
}

interface SelectItemProps extends CustomSingleSelectProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = React.FC<React.PropsWithChildren<SelectItemProps>>;

export function SelectItem({
  children,
  style,
  note,
  ...props
}: React.PropsWithChildren<SelectItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      notePosition="after"
      disabled={props.disabled}
      divider>
      <CustomSingleSelect {...props} />
    </FormItem>
  );
}
