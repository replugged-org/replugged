import type React from "react";
import type { ObjectExports } from "../../../types";
import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "../webpack";

const mod = await waitForModule(filters.bySource("LABEL_SELECTED"));
const FormTextComp = getFunctionBySource(
  mod as ObjectExports,
  '"type","className","disabled","selectable","children","style"',
) as React.ComponentType<React.PropsWithChildren<FormTextProps>>;
const types = getExportsForProps(mod, ["LABEL_SELECTED"])!;

interface FormTextProps {
  type?: string;
  disabled?: boolean;
  selectable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export type FormTextType = Record<
  | "DEFAULT"
  | "DESCRIPTION"
  | "ERROR"
  | "INPUT_PLACEHOLDER"
  | "LABEL_BOLD"
  | "LABEL_DESCRIPTOR"
  | "LABEL_SELECTED"
  | "SUCCESS"
  | string,
  React.FC<React.PropsWithChildren<FormTextProps>>
>;
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

Object.keys(types).forEach((key: string) => {
  FormText[key] = (props: React.PropsWithChildren<FormTextProps>) => (
    <FormTextComp type={types[key] as string} {...props}>
      {props.children}
    </FormTextComp>
  );
});
