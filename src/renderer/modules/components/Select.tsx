import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

import type * as Design from "discord-client-types/discord_app/design/web";

const selectSource = '"renderLeading","renderTrailing","value","onChange"';
const mod = await waitForModule(filters.bySource(selectSource));
const SingleSelect = getFunctionBySource<Design.SingleSelect>(mod, selectSource)!;

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
