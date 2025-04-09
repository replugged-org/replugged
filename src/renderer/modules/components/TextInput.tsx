import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

interface TextInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<"input">,
    "size" | "onChange" | "onFocus" | "onBlur"
  > {
  editable?: boolean;
  inputPrefix?: string;
  prefixElement?: React.ReactNode;
  size?: string;
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
  Sizes: Record<"DEFAULT" | "MINI", string>;
};

export default getFunctionBySource<TextInputType>(components, ".inputPrefix")!;
