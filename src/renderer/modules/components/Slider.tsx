import { filters, waitForModule } from "../webpack";

interface SliderProps {
  disabled?: boolean;
  markers?: number[];
  stickToMarkers?: boolean;
  initialValue?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  mini?: boolean;
  style?: React.CSSProperties;
  onValueChange?: (e: number) => void;
  asValueChanges?: (e: number) => void;
  onValueRender?: (e: number) => string;
  onMarkerRender?: (e: number) => string;
}

export type SliderType = React.ComponentType<SliderProps> & {
  defaultProps: SliderProps;
};

export default (await waitForModule(filters.bySource(".moveGrabber=")).then((mod) =>
  Object.values(mod).find((x) => "defaultProps" in x && "stickToMarkers" in x.defaultProps),
)) as SliderType;
