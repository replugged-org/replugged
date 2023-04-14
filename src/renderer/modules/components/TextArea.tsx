import type React from "react";
import { filters, waitForModule } from "../webpack";

interface TextAreaProps {
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
  allowOverflow?: boolean;
  resizeable?: boolean;
  flex?: boolean;
  autosize?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  name?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  className?: string;
  onChange?: (e: string) => void;
  onInvalid?: (e: React.FormEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export type TextAreaType = React.ComponentType<TextAreaProps> & {
  defaultProps: TextAreaProps;
};

export default await waitForModule<Record<string, TextAreaType>>(
  filters.bySource(/.resizeable,/),
).then((mod) => Object.values(mod).find((x) => x?.defaultProps && "resizeable" in x.defaultProps)!);
