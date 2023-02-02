import { filters, waitForModule } from "../webpack";

interface TextInputProps {
  autoFocus?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  size?: string;
  type?: string;
  error?: string;
  value?: string;
  onChange?: (e: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export type TextInputType = React.ComponentType<TextInputProps> & {
  defaultProps: TextInputProps;
};

export default await waitForModule(filters.bySource(".getIsOverFlowing")).then((mod) =>
  Object.values(mod).find((x) => "defaultProps" in x && "maxLength" in x.defaultProps),
);
