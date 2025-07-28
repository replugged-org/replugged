import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

interface TextInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange" | "onFocus" | "onBlur"> {
  editable?: boolean;
  prefixElement?: React.ReactNode;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  focusProps?: Record<string, unknown>;
  inputClassName?: string;
  defaultDirty?: boolean;
  onChange?: (value: string, name: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>, name: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>, name: string) => void;
}

export type TextInputType = React.ComponentClass<TextInputProps> & {
  defaultProps: TextInputProps;
};

const TextInputString = "prefixElement:";
const TextInputMod = await waitForModule(filters.bySource(TextInputString));
export default getFunctionBySource<TextInputType>(TextInputMod, TextInputString)!;
