import type React from "react";
import { Divider, FormText } from ".";
import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

interface FormItemCompProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "label" | "legend";
  style?: React.CSSProperties;
  className?: string;
  titleClassName?: string;
}

const formItemStr =
  '"children","disabled","className","titleClassName","tag","required","style","title","error"';

const FormItemComp = await waitForModule(filters.bySource(formItemStr)).then((mod) =>
  Object.values(mod).find((x) => x?.render?.toString()?.includes(formItemStr)),
);

const classes = await waitForModule<Record<"dividerDefault", string>>(filters.byProps("labelRow"));

interface FormItemProps extends FormItemCompProps {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
}

export type FormItemType = ReactComponent<FormItemProps>;

export default ((props) => {
  const { note, notePosition = "before", noteStyle, noteClassName, divider, ...compProps } = props;
  return (
    <FormItemComp {...compProps}>
      {note && notePosition === "before" && (
        <FormText.DESCRIPTION
          disabled={props.disabled}
          className={noteClassName}
          style={{ marginBottom: 8, ...noteStyle }}>
          {note}
        </FormText.DESCRIPTION>
      )}
      {props.children}
      {note && notePosition === "after" && (
        <FormText.DESCRIPTION
          disabled={props.disabled}
          className={noteClassName}
          style={{ marginTop: 8, ...noteStyle }}>
          {note}
        </FormText.DESCRIPTION>
      )}
      {divider && <Divider className={classes.dividerDefault} />}
    </FormItemComp>
  );
}) as FormItemType;
