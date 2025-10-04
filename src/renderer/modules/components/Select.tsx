import { getFunctionBySource } from "@webpack";
import type React from "react";
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

function CustomSingleSelect<
  TOptions extends readonly Design.SelectOption[] = readonly Design.SelectOption[],
  TClearable extends boolean = false,
>({ disabled, ...props }: CustomSingleSelectProps<TOptions, TClearable>): React.ReactElement {
  return <SingleSelect isDisabled={disabled} {...props} />;
}

export default CustomSingleSelect;
