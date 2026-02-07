import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

import type {
  VoidSelectOption,
  VoidSingleSelect,
  VoidSingleSelectProps,
} from "discord-client-types/discord_app/design/components/VoidSelect/web/VoidSelect";

const selectRegex = /renderLeading:\i,renderTrailing:\i,value:\i,onChange:\i/;
const mod = await waitForModule(filters.bySource(selectRegex));

const VoidSingleSelect = getFunctionBySource<VoidSingleSelect>(mod, selectRegex)!;

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
  return <VoidSingleSelect isDisabled={disabled} {...props} />;
}

export default CustomSingleSelect;
