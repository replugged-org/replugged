import { parser } from "@common";
import type React from "react";
import components from "../common/components";

export type Variant =
  | "heading-sm/normal"
  | "heading-sm/medium"
  | "heading-sm/semibold"
  | "heading-sm/bold"
  | "heading-sm/extrabold"
  | "heading-md/normal"
  | "heading-md/medium"
  | "heading-md/semibold"
  | "heading-md/bold"
  | "heading-md/extrabold"
  | "heading-lg/normal"
  | "heading-lg/medium"
  | "heading-lg/semibold"
  | "heading-lg/bold"
  | "heading-lg/extrabold"
  | "heading-xl/normal"
  | "heading-xl/medium"
  | "heading-xl/semibold"
  | "heading-xl/bold"
  | "heading-xl/extrabold"
  | "heading-xxl/normal"
  | "heading-xxl/medium"
  | "heading-xxl/semibold"
  | "heading-xxl/bold"
  | "heading-xxl/extrabold"
  | "eyebrow"
  | "heading-deprecated-12/normal"
  | "heading-deprecated-12/medium"
  | "heading-deprecated-12/semibold"
  | "heading-deprecated-12/bold"
  | "heading-deprecated-12/extrabold"
  | "redesign/heading-18/bold"
  | "text-xxs/normal"
  | "text-xxs/medium"
  | "text-xxs/semibold"
  | "text-xxs/bold"
  | "text-xs/normal"
  | "text-xs/medium"
  | "text-xs/semibold"
  | "text-xs/bold"
  | "text-sm/normal"
  | "text-sm/medium"
  | "text-sm/semibold"
  | "text-sm/bold"
  | "text-md/normal"
  | "text-md/medium"
  | "text-md/semibold"
  | "text-md/bold"
  | "text-lg/normal"
  | "text-lg/medium"
  | "text-lg/semibold"
  | "text-lg/bold"
  | "redesign/message-preview/normal"
  | "redesign/message-preview/medium"
  | "redesign/message-preview/semibold"
  | "redesign/message-preview/bold"
  | "redesign/channel-title/normal"
  | "redesign/channel-title/medium"
  | "redesign/channel-title/semibold"
  | "redesign/channel-title/bold"
  | "display-sm"
  | "display-md"
  | "display-lg"
  | "code";

// TODO: generic type for tags?
interface TextProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: Variant;
  tag?: keyof React.JSX.IntrinsicElements;
  selectable?: boolean;
  tabularNumbers?: boolean;
  lineClamp?: number;
  scaleFontToUserSetting?: boolean;
}

interface CustomTextProps extends TextProps {
  markdown?: boolean;
  allowMarkdownLinks?: boolean;
  allowMarkdownHeading?: boolean;
  allowMarkdownList?: boolean;
}

export type OriginalTextType = React.FC<CustomTextProps>;

export type TextType = OriginalTextType &
  Record<"Normal" | "H1" | "H2" | "H3" | "H4" | "Eyebrow", OriginalTextType>;

const TextComp = components.Text;

function TextWithDefaultProps(defaultProps: CustomTextProps) {
  return (props: CustomTextProps) => {
    props = { ...defaultProps, ...props };
    const { children } = props;
    const newChildren =
      props.markdown && typeof children === "string"
        ? parser.parse(children, true, {
            allowLinks: props.allowMarkdownLinks,
            allowHeading: props.allowMarkdownHeading,
            allowList: props.allowMarkdownList,
          })
        : children;
    delete props.markdown;
    delete props.allowMarkdownLinks;
    delete props.allowMarkdownHeading;
    delete props.allowMarkdownList;
    return <TextComp {...props}>{newChildren}</TextComp>;
  };
}

const Text = TextWithDefaultProps({}) as TextType;
Text.Normal = TextWithDefaultProps({ variant: "text-sm/normal", tag: "span" });
Text.H1 = TextWithDefaultProps({ variant: "heading-xl/bold", color: "header-primary", tag: "h1" });
Text.H2 = TextWithDefaultProps({
  variant: "heading-lg/semibold",
  color: "header-primary",
  tag: "h2",
});
Text.H3 = TextWithDefaultProps({ variant: "heading-md/bold", tag: "h3" });
Text.H4 = TextWithDefaultProps({ variant: "heading-sm/bold", tag: "h4" });
Text.Eyebrow = TextWithDefaultProps({ variant: "eyebrow" });

export default Text;
