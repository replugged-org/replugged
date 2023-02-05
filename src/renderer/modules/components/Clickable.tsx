import { filters, waitForModule } from "../webpack";

type ClickableProps = React.HTMLAttributes<HTMLDivElement> & {
  tag?: string;
  tabIndex?: number;
};

export type ClickableType = React.FC<ClickableProps>;

const Clickable = (await waitForModule(filters.bySource("renderNonInteractive")).then((mod) =>
  Object.values(mod).find((x) => x.prototype?.renderNonInteractive),
)) as ClickableType;

export default (props: ClickableProps): React.ReactElement => {
  const style = props.style || {};
  style.cursor = "pointer";
  return <Clickable {...props} style={style} />;
};
