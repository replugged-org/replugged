import type React from "react";
import type { ReactComponent } from "../../../types";
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

const mod = await waitForModule(filters.bySource("LABEL_SELECTED"));
const FormTextComp = getFunctionBySource<ReactComponent<{ type: string }>>(
  mod,
  '"type","className","disabled","selectable","children","style"',
)!;
const types = getExportsForProps<Record<FormTextTypeKey, string>>(mod, ["LABEL_SELECTED"])!;

export type FormTextType = Record<
  FormTextTypeKey,
  ReactComponent<{
    children?: React.ReactNode;
    disabled?: boolean;
    selectable?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }>
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

Object.keys(types).forEach((key) => {
  FormText[key] = (props: React.PropsWithChildren<Record<string, unknown>>) => (
    <FormTextComp type={types[key]} {...props}>
      {props.children}
    </FormTextComp>
  );
});
