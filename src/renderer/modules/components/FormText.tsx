import { ObjectExports, ReactComponent } from "../../../types";
import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "../webpack";

const mod = (await waitForModule(filters.bySource("LABEL_SELECTED"), {
  timeout: 10000,
})) as ObjectExports;
const FormTextComp = getFunctionBySource("selectable", mod) as ReactComponent<{ type: string }>;
const types = getExportsForProps(mod, ["LABEL_SELECTED"]) as Record<string, string>;

const FormText: Record<string, ReactComponent<{}>> = {};

Object.keys(types).forEach((key) => {
  FormText[key] = (props) => (
    <FormTextComp type={types[key]} {...props}>
      {props.children}
    </FormTextComp>
  );
});

export default FormText;
