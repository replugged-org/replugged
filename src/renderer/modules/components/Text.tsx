import { parser } from "@common";
import components from "../common/components";

import type * as CommonDesign from "discord-client-types/discord_common/packages/design/web";

interface CustomTextProps extends CommonDesign.TextProps {
  markdown?: boolean;
  allowMarkdownLinks?: boolean;
  allowMarkdownHeading?: boolean;
  allowMarkdownList?: boolean;
}

export type CustomTextType = CommonDesign.Text &
  Record<"Normal" | "H1" | "H2" | "H3" | "H4" | "Eyebrow", React.FC<CustomTextProps>>;

const { Text } = components;

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
    return <Text {...props}>{newChildren}</Text>;
  };
}

const CustomText = TextWithDefaultProps({}) as CustomTextType;
CustomText.Normal = TextWithDefaultProps({ variant: "text-sm/normal", tag: "span" });
CustomText.H1 = TextWithDefaultProps({
  variant: "heading-xl/bold",
  color: "header-primary",
  tag: "h1",
});
CustomText.H2 = TextWithDefaultProps({
  variant: "heading-lg/semibold",
  color: "header-primary",
  tag: "h2",
});
CustomText.H3 = TextWithDefaultProps({ variant: "heading-md/bold", tag: "h3" });
CustomText.H4 = TextWithDefaultProps({ variant: "heading-sm/bold", tag: "h4" });
CustomText.Eyebrow = TextWithDefaultProps({ variant: "eyebrow" });

export default CustomText;
