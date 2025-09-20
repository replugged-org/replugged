import { classNames, marginStyles } from "@common";
import { getComponentBySource, waitForProps } from "@webpack";
import type React from "react";
import { Divider, FormText } from ".";
import components from "../common/components";

import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";
import type * as Design from "discord-client-types/discord_app/design/web";

const FormItem = getComponentBySource<Design.FormItem>(components, ".fieldWrapper")!;

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

interface CustomFormItemProps extends Design.FormItemProps {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
}

export type CustomFormItemType = React.FC<CustomFormItemProps>;

function CustomFormItem({
  children,
  note,
  notePosition = "before",
  noteStyle,
  noteClassName,
  divider,
  ...props
}: CustomFormItemProps): React.ReactElement {
  const noteContent = note && (
    <FormText.DESCRIPTION
      disabled={props.disabled}
      className={classNames(
        noteClassName,
        notePosition === "before" ? marginStyles.marginBottom8 : marginStyles.marginTop8,
      )}
      style={noteStyle}>
      {note}
    </FormText.DESCRIPTION>
  );

  return (
    <FormItem {...props}>
      {notePosition === "before" && noteContent}
      {children}
      {notePosition === "after" && noteContent}
      {divider && <Divider className={classes.dividerDefault} />}
    </FormItem>
  );
}

export default CustomFormItem;
