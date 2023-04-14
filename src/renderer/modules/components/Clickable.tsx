import type React from "react";
import { filters, waitForModule } from "../webpack";

type ClickableProps = React.HTMLAttributes<HTMLDivElement> & {
  onClick?: () => void;
  role?: string;
  tag?: string;
  tabIndex?: number;
  style?: React.CSSProperties;
  className?: string;
};

export type ClickableType = React.FC<React.PropsWithChildren<ClickableProps>>;

const Clickable = await waitForModule<Record<string, ClickableType>>(
  filters.bySource("renderNonInteractive"),
).then((mod) => Object.values(mod).find((x) => x.prototype?.renderNonInteractive)!);

export default (props: React.PropsWithChildren<ClickableProps>): React.ReactElement => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
