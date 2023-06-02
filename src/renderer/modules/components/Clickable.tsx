import type React from "react";
import { filters, waitForModule } from "../webpack";

// TODO: generic type for tags?
type ClickableProps = React.ComponentPropsWithoutRef<"div"> & {
  tag?: keyof JSX.IntrinsicElements;
  ignoreKeyPress?: boolean;
};

type ClickableCompType = React.ComponentClass<React.PropsWithChildren<ClickableProps>> & {
  defaultProps: ClickableProps;
};

const Clickable = await waitForModule<Record<string, ClickableCompType>>(
  filters.bySource("renderNonInteractive"),
).then((mod) => Object.values(mod).find((x) => x.prototype?.renderNonInteractive)!);

export type ClickableType = React.FC<React.PropsWithChildren<ClickableProps>>;

export default (props: React.PropsWithChildren<ClickableProps>): React.ReactElement => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
