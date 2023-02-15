import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "../webpack";

const mod = await waitForModule(filters.bySource("LABEL_SELECTED"));
const FormTextComp = getFunctionBySource(
  mod as ObjectExports,
  '"type","className","disabled","selectable","children","style"',
) as ReactComponent<{ type: string }>;
const types = getExportsForProps(mod, ["LABEL_SELECTED"])!;

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

Object.keys(types).forEach((key: string) => {
  FormText[key] = (props: React.PropsWithChildren<Record<string, unknown>>) => (
    <FormTextComp type={types[key] as string} {...props}>
      {props.children}
    </FormTextComp>
  );
});
