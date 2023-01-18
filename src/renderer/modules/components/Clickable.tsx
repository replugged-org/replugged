import { filters, waitForModule } from "../webpack";

interface ClickableProps {
  "aria-label"?: string;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
  style?: React.CSSProperties;
  onClick?: () => void;
}

export type ClickableType = React.FC<ClickableProps>;

const Clickable = (await waitForModule(filters.bySource("renderNonInteractive")).then((mod) =>
  Object.values(mod).find((x) => x.prototype?.renderNonInteractive),
)) as ClickableType;

export default (props: ClickableProps) => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
