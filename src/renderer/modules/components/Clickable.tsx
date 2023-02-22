import type React from "react";
import { filters, waitForModule } from "../webpack";

interface ClickableProps {
  onClick?: () => void;
  role?: string;
  tag?: string;
  tabIndex?: number;
  style?: React.CSSProperties;
  className?: string;
}

export type ClickableType = React.FC<React.PropsWithChildren<ClickableProps>>;

const Clickable = (await waitForModule(filters.bySource("renderNonInteractive")).then((mod) =>
  Object.values(mod).find((x) => x.prototype?.renderNonInteractive),
)) as ClickableType;

export default (props: React.PropsWithChildren<ClickableProps>): React.ReactElement => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
