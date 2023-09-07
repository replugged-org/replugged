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
  spellCheck?: boolean;
  showCharacterCount?: boolean;
  showRemainingCharacterCount?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  name?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  onChange?: (value: string) => void;
  onInvalid?: React.FormEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export type TextAreaType = React.ComponentClass<TextAreaProps> & {
  defaultProps: TextAreaProps;
};

export default await waitForModule<Record<string, TextAreaType>>(
  filters.bySource(/.resizeable,/),
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
).then((mod) => Object.values(mod).find((x) => x?.defaultProps && "resizeable" in x.defaultProps)!);
