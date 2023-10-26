import type React from "react";
import components from "../common/components";

interface TextInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size" | "onChange"> {
  editable?: boolean;
  inputPrefix?: string;
  prefixElement?: React.ReactNode;
  size?: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  focusProps?: Record<string, unknown>;
  inputClassName?: string;
  onChange?: (value: string) => void;
}

export type TextInputType = React.ComponentClass<TextInputProps> & {
  defaultProps: TextInputProps;
  Sizes: Record<"DEFAULT" | "MINI", string>;
};

export default components.TextInput;
