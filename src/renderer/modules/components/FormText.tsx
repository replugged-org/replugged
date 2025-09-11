import { getExportsForProps, getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

export type FormTextTypeKey = "DEFAULT" | "DESCRIPTION" | string;

interface FormTextProps extends React.ComponentPropsWithoutRef<"div"> {
  type?: string;
  disabled?: boolean;
  selectable?: boolean;
}

export type FormTextCompType = React.FC<React.PropsWithChildren<FormTextProps>>;

export type FormTextType = Record<FormTextTypeKey, FormTextCompType>;

const FormTextComp = getFunctionBySource<FormTextCompType>(components, /type:\w+=\w+\.DEFAULT/)!;
const FormTextTypes = getExportsForProps<Record<FormTextTypeKey, string>>(components, [
  "DEFAULT",
  "DESCRIPTION",
]);

export const FormText: FormTextType = {
  DEFAULT: () => null,
  DESCRIPTION: () => null,
};

if (typeof FormTextTypes === "object" && FormTextTypes !== null)
  Object.keys(FormTextTypes).forEach((key) => {
    FormText[key] = (props: React.PropsWithChildren<FormTextProps>) => (
      <FormTextComp type={FormTextTypes[key]} {...props}>
        {props.children}
      </FormTextComp>
    );
  });
