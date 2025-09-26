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

interface CustomSingleSelectProps<
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
> extends Design.SingleSelectProps<TOptions, TClearable> {
  disabled?: boolean;
}

export type CustomSingleSelectType = <
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
>(
  props: React.PropsWithChildren<CustomSingleSelectProps<TOptions, TClearable>>,
) => React.ReactElement;

export function CustomSingleSelect<
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
>({ disabled, ...props }: CustomSingleSelectProps<TOptions, TClearable>): React.ReactElement {
  return <SingleSelect isDisabled={disabled} {...props} />;
}

interface SelectItemProps<
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
> extends CustomSingleSelectProps<TOptions, TClearable> {
  note?: string;
  style?: React.CSSProperties;
}

export type SelectItemType = <
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
>(
  props: React.PropsWithChildren<SelectItemProps<TOptions, TClearable>>,
) => React.ReactElement;

export function SelectItem<
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
>({
  children,
  style,
  note,
  ...props
}: React.PropsWithChildren<SelectItemProps<TOptions, TClearable>>): React.ReactElement {
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
