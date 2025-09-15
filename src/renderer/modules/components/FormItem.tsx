import { classNames, sharedStyles } from "@common";
import { filters, waitForModule, waitForProps } from "@webpack";
import type React from "react";
import { Divider, FormText } from ".";

import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";
import type * as Design from "discord-client-types/discord_app/design/web";

const formItemStr = ".fieldWrapper";
const FormItem = await waitForModule<Record<string, Design.FormItem>>(
  filters.bySource(formItemStr),
).then((mod) => Object.values(mod).find((x) => x?.render?.toString()?.includes(formItemStr))!);

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

type CustomFormItemProps = Design.FormItemProps & {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
};

export type CustomFormItemType = React.FC<CustomFormItemProps>;

function CustomFormItem({
  children,
  note,
  notePosition = "before",
  noteStyle,
  noteClassName,
  divider,
  ...restProps
}: CustomFormItemProps): React.ReactElement {
  const noteContent = note && (
    <FormText.DESCRIPTION
      disabled={restProps.disabled}
      className={classNames(
        noteClassName,
        notePosition === "before"
          ? sharedStyles.MarginStyles.marginBottom8
          : sharedStyles.MarginStyles.marginTop8,
      )}
      style={noteStyle}>
      {note}
    </FormText.DESCRIPTION>
  );

  return (
    <FormItem {...restProps}>
      {notePosition === "before" && noteContent}
      {children}
      {notePosition === "after" && noteContent}
      {divider && <Divider className={classes.dividerDefault} />}
    </FormItem>
  );
}

export default CustomFormItem;
