import { getExportsForProps, getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

import type { FormTextProps } from "discord-client-types/discord_app/design/components/Forms/web/FormText";
import type * as Design from "discord-client-types/discord_app/design/web";

const FormText = getFunctionBySource<Design.FormText>(components, /type:\w+=\w+\.DEFAULT/)!;
const FormTextTypes = getExportsForProps<Record<FormTextTypeKey, string>>(components, [
  "LABEL_DESCRIPTOR",
  "INPUT_PLACEHOLDER",
]);

export type FormTextTypeKey = keyof Design.FormTextTypes;

export type CustomFormTextType = Record<
  FormTextTypeKey,
  React.FC<React.PropsWithChildren<FormTextProps>>
>;

export const CustomFormText: CustomFormTextType = {
  DEFAULT: () => null,
  DESCRIPTION: () => null,
  ERROR: () => null,
  INPUT_PLACEHOLDER: () => null,
  LABEL_BOLD: () => null,
  LABEL_DESCRIPTOR: () => null,
  LABEL_SELECTED: () => null,
  SUCCESS: () => null,
};

if (typeof FormTextTypes === "object" && FormTextTypes !== null)
  Object.keys(FormTextTypes).forEach((key) => {
    CustomFormText[key as FormTextTypeKey] = (props: React.PropsWithChildren<FormTextProps>) => (
      <FormText type={FormTextTypes[key as FormTextTypeKey]} {...props}>
        {props.children}
      </FormText>
    );
  });
