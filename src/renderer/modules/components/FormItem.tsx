import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";
import { Divider, FormText } from ".";

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
  divider?: boolean;
}

export type FormItemType = ReactComponent<FormItemProps>;

export default ((props) => {
  if (!props.notePosition) props.notePosition = "before";
  return (
    <FormItemComp {...props}>
      {props.note && props.notePosition === "before" && (
        <FormText.DESCRIPTION style={{ marginBottom: 8 }}>{props.note}</FormText.DESCRIPTION>
      )}
      {props.children}
      {props.note && props.notePosition === "after" && (
        <FormText.DESCRIPTION style={{ marginTop: 8 }}>{props.note}</FormText.DESCRIPTION>
      )}
      {props.divider && <Divider className={classes.dividerDefault} />}
    </FormItemComp>
  );
}) as FormItemType;
