import type React from "react";
import { Divider, FormText } from ".";
import components from "../common/components";
import { waitForProps } from "../webpack";

interface FormItemCompProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  error?: React.ReactNode;
  faded?: boolean;
  disabled?: boolean;
  required?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "label" | "legend";
  titleId?: string;
  errorId?: string;
  titleClassName?: string;
}

export type FormItemCompType = React.ForwardRefExoticComponent<FormItemCompProps> & {
  render: React.ForwardRefRenderFunction<unknown>;
};

interface FormItemProps extends FormItemCompProps {
  note?: string;
  notePosition?: "before" | "after";
  noteStyle?: React.CSSProperties;
  noteClassName?: string;
  divider?: boolean;
}

export type FormItemType = React.FC<FormItemProps>;

const getFormItem = async (): Promise<FormItemType> => {
  const FormItemComp = (await components).FormItem;

  const classes = await waitForProps<Record<"dividerDefault", string>>("dividerDefault");
  return (props) => {
    const {
      note,
      notePosition = "before",
      noteStyle,
      noteClassName,
      divider,
      ...compProps
    } = props;

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
      <FormItemComp {...compProps}>
        {note && notePosition === "before" && noteComp}
        {props.children}
        {note && notePosition === "after" && noteComp}
        {divider && <Divider className={classes.dividerDefault} />}
      </FormItemComp>
    );
  };
};

export default getFormItem();
