import type React from "react";
import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "../webpack";

type FormTextTypeKey =
  | "DEFAULT"
  | "DESCRIPTION"
  | "ERROR"
  | "INPUT_PLACEHOLDER"
  | "LABEL_BOLD"
  | "LABEL_DESCRIPTOR"
  | "LABEL_SELECTED"
  | "SUCCESS"
  | string;

interface FormTextProps {
  type?: string;
  disabled?: boolean;
  selectable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

type FormTextCompType = React.FC<React.PropsWithChildren<FormTextProps>>;

export type FormTextType = Record<FormTextTypeKey, FormTextCompType>;

const mod = await waitForModule(filters.bySource("LABEL_SELECTED"));
const FormTextComp = getFunctionBySource<FormTextCompType>(
  mod,
  '"type","className","disabled","selectable","children","style"',
)!;
const types = getExportsForProps<Record<FormTextTypeKey, string>>(mod, ["LABEL_SELECTED"])!;

export const FormText: FormTextType = {
  DEFAULT: () => null,
  DESCRIPTION: () => null,
  ERROR: () => null,
  INPUT_PLACEHOLDER: () => null,
  LABEL_BOLD: () => null,
  LABEL_DESCRIPTOR: () => null,
  LABEL_SELECTED: () => null,
  SUCCESS: () => null,
};

if (typeof types === "object")
  Object.keys(types).forEach((key) => {
    FormText[key] = (props: React.PropsWithChildren<FormTextProps>) => (
      <FormTextComp type={types[key]} {...props}>
        {props.children}
      </FormTextComp>
    );
  });
