import { filters, waitForModule, waitForProps } from "@webpack";
import type React from "react";
import { Divider, FormText } from ".";

import type { FormItemProps } from "discord-client-types/discord_app/design/components/Forms/web/FormItem";
import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";
import type * as Design from "discord-client-types/discord_app/design/web";

const formItemStr = ".fieldWrapper";
const FormItem = await waitForModule<Record<string, Design.FormItem>>(
  filters.bySource(formItemStr),
).then((mod) => Object.values(mod).find((x) => x?.render?.toString()?.includes(formItemStr))!);

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

type CustomFormItemProps = FormItemProps & {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
};

export type CustomFormItemType = React.FC<CustomFormItemProps>;

export default (props: CustomFormItemProps): React.ReactElement => {
  const { note, notePosition = "before", noteStyle, noteClassName, divider, ...compProps } = props;

  const noteStyleDefault = notePosition === "before" ? { marginBottom: 8 } : { marginTop: 8 };
  const noteComp = (
    <FormText.DESCRIPTION
      disabled={props.disabled}
      className={noteClassName}
      style={{ ...noteStyleDefault, ...noteStyle }}>
      {note}
    </FormText.DESCRIPTION>
  );

  return (
    <FormItem {...compProps}>
      {note && notePosition === "before" && noteComp}
      {props.children}
      {note && notePosition === "after" && noteComp}
      {divider && <Divider className={classes.dividerDefault} />}
    </FormItem>
  );
};
