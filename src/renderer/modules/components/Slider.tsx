import { ReactComponent } from "src/types";
import { filters, waitForModule } from "../webpack";

export interface SliderCompProps {
  disabled?: boolean;
  markers?: number[];
  stickToMarkers?: boolean;
  initialValue?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  mini?: boolean;
  style?: React.CSSProperties;
  className?: string;
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

export default ((props) => {
  return (
    <SliderComp initialValue={props.value} onValueChange={props.onChange} {...props}></SliderComp>
  );
}) as SliderType;
