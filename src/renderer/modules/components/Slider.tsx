import { ReactComponent } from "src/types";
import { filters, waitForModule } from "../webpack";

interface SliderCompProps {
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

type SliderCompType = React.ComponentType<SliderCompProps> & {
  defaultProps: SliderCompProps;
};

const SliderComp = (await waitForModule(filters.bySource(".moveGrabber=")).then((mod) =>
  Object.values(mod).find((x) => "defaultProps" in x && "stickToMarkers" in x.defaultProps),
)) as SliderCompType;

interface SliderProps extends SliderCompProps {
  value?: number;
  onChange?: (e: number) => void;
}

type SliderType = ReactComponent<SliderProps>;

export default ((props) => {
  return (
    <SliderComp {...props} initialValue={props.value} onValueChange={props.onChange}></SliderComp>
  );
}) as SliderType;
