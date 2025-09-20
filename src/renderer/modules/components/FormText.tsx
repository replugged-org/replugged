import { getExportsForProps, getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const FormText = getFunctionBySource<Design.FormText>(components, /type:\i=\i\.DEFAULT/)!;
const FormTextTypes = getExportsForProps<Record<FormTextTypeKey, string>>(components, [
  "DEFAULT",
  "DESCRIPTION",
]);

export type FormTextTypeKey = keyof Design.FormTextTypes;

export type CustomFormTextType = Record<
  FormTextTypeKey,
  React.FC<React.PropsWithChildren<Design.FormTextProps>>
>;

export const CustomFormText: CustomFormTextType = {
  DEFAULT: () => null,
  DESCRIPTION: () => null,
};

if (typeof FormTextTypes === "object" && FormTextTypes !== null)
  Object.keys(FormTextTypes).forEach((key) => {
    CustomFormText[key as FormTextTypeKey] = (
      props: React.PropsWithChildren<Design.FormTextProps>,
    ) => (
      <FormText type={FormTextTypes[key as FormTextTypeKey]} {...props}>
        {props.children}
      </FormText>
    );
  });
