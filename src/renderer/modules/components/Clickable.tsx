import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

// TODO: generic type for tags?
type ClickableProps = React.ComponentPropsWithoutRef<"div"> & {
  tag?: keyof React.JSX.IntrinsicElements;
  focusProps?: Record<string, unknown>;
  innerRef?: React.Ref<HTMLDivElement>;
  ignoreKeyPress?: boolean;
};

export type ClickableCompType = React.ComponentClass<React.PropsWithChildren<ClickableProps>> & {
  defaultProps: ClickableProps;
};

const Clickable = getFunctionBySource<ClickableType>(components, "this.renderNonInteractive()")!;

export type ClickableType = React.FC<React.PropsWithChildren<ClickableProps>>;

export default (props: React.PropsWithChildren<ClickableProps>): React.ReactElement => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
