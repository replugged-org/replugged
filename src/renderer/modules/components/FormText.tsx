import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "../webpack";

const mod = (await waitForModule(filters.bySource("LABEL_SELECTED"))) as ObjectExports;
const FormTextComp = getFunctionBySource(
  '"type","className","disabled","selectable","children","style"',
  mod,
) as ReactComponent<{ type: string }>;
const types = getExportsForProps(mod, ["LABEL_SELECTED"]) as Record<
  | "DEFAULT"
  | "DESCRIPTION"
  | "ERROR"
  | "INPUT_PLACEHOLDER"
  | "LABEL_BOLD"
  | "LABEL_DESCRIPTOR"
  | "LABEL_SELECTED"
  | "SUCCESS"
  | string,
  string
>;

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
  ReactComponent<{}>
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
    <FormTextComp type={types[key]} {...props}>
      {props.children}
    </FormTextComp>
  );
});
