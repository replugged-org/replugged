import { parser } from "@common";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

type Variant =
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
  | "display-sm"
  | "display-md"
  | "display-lg"
  | "code";

interface TextProps {
  variant?: Variant;
  tag?: string;
  selectable?: boolean;
  className?: string;
  lineClamp?: number;
  color?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

interface CustomTextProps extends TextProps {
  markdown?: boolean;
  allowMarkdownLinks?: boolean;
  allowMarkdownHeading?: boolean;
  allowMarkdownList?: boolean;
}

type OriginalTextType = React.ComponentType<CustomTextProps>;

export type TextType = OriginalTextType &
  Record<"Normal" | "H1" | "H2" | "H3" | "H4" | "Eyebrow", OriginalTextType>;

const mod = await waitForModule<ObjectExports>(filters.bySource("data-text-variant"));
const OriginalText = getFunctionBySource(mod, "data-text-variant") as OriginalTextType;

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
    return <OriginalText {...props}>{newChildren}</OriginalText>;
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
