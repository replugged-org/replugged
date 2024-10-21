import type React from "react";
import components from "../common/components";

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
  showCharacterCountFullPadding?: boolean;
  showRemainingCharacterCount?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  name?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  id?: string;
  defaultDirty?: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  className?: string;
  onChange?: (value: string, name: string) => void;
  onInvalid?: React.FormEventHandler<HTMLTextAreaElement>;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>, name: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>, name: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  "aria-labelledby"?: string;
}

export type TextAreaType = React.ComponentClass<TextAreaProps> & {
  defaultProps: TextAreaProps;
};

export default components.TextArea;
