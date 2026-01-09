import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

import type {
  VoidSelectOption,
  VoidSingleSelect,
  VoidSingleSelectProps,
} from "discord-client-types/discord_app/design/components/VoidSelect/web/VoidSelect";

const selectSource = '"renderLeading","renderTrailing","value","onChange"';
const mod = await waitForModule(filters.bySource(selectSource));
const SingleSelect = getFunctionBySource<VoidSingleSelect>(mod, selectSource)!;

interface CustomSingleSelectProps<
  TOptions extends readonly VoidSelectOption[] = readonly VoidSelectOption[],
  TClearable extends boolean = false,
> extends VoidSingleSelectProps<TOptions, TClearable> {
  disabled?: boolean;
}

export type CustomSingleSelectType = <
  TOptions extends readonly VoidSelectOption[] = readonly VoidSelectOption[],
  TClearable extends boolean = false,
>(
  props: React.PropsWithChildren<CustomSingleSelectProps<TOptions, TClearable>>,
) => React.ReactElement;

function CustomSingleSelect<
  TOptions extends readonly VoidSelectOption[] = readonly VoidSelectOption[],
  TClearable extends boolean = false,
>({ disabled, ...props }: CustomSingleSelectProps<TOptions, TClearable>): React.ReactElement {
  return <SingleSelect isDisabled={disabled} {...props} />;
}

export default CustomSingleSelect;
