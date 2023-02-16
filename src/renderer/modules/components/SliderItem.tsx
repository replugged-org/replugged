import { ReactComponent } from "src/types";
import { filters, waitForModule } from "../webpack";
import { FormItem } from ".";

export interface SliderCompProps {
  disabled?: boolean;
  markers?: number[];
  stickToMarkers?: boolean;
  initialValue?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  mini?: boolean;
  hideBubble?: boolean;
  barStyles?: React.CSSProperties;
  fillStyles?: React.CSSProperties;
  grabberStyles?: React.CSSProperties;
  className?: string;
  barClassName?: string;
  grabberClassName?: string;
  onValueChange?: (e: number) => void;
  asValueChanges?: (e: number) => void;
  onValueRender?: (e: number) => string;
  onMarkerRender?: (e: number) => string;
}

export type SliderCompType = React.ComponentType<SliderCompProps> & {
  defaultProps: SliderCompProps;
};

const SliderComp = await waitForModule(filters.bySource(".moveGrabber=")).then((mod) =>
  Object.values(mod).find((x) => "defaultProps" in x && "stickToMarkers" in x.defaultProps),
);

export interface SliderProps extends SliderCompProps {
  value?: number;
  onChange?: (e: number) => void;
}

export type SliderType = ReactComponent<SliderProps>;

export const Slider = ((props) => {
  return <SliderComp initialValue={props.value} onValueChange={props.onChange} {...props} />;
}) as SliderType;

interface SliderItemProps extends SliderProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SliderItemType = React.FC<React.PropsWithChildren<SliderItemProps>>;

export const SliderItem = (props: React.PropsWithChildren<SliderItemProps>): React.ReactElement => {
  const { children } = props;
  delete props.children;
  return (
    <FormItem
      title={children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      noteStyle={{ marginBottom: props.markers ? 16 : 4 }}
      divider>
      <Slider {...props} />
    </FormItem>
  );
};
