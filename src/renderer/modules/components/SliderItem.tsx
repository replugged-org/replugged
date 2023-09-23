import type React from "react";
import { FormItem } from ".";
import { filters, waitForModule } from "../webpack";

const MarkerPositions = {
  ABOVE: 0,
  BELOW: 1,
} as const;

interface SliderCompProps {
  disabled?: boolean;
  markers?: number[];
  stickToMarkers?: boolean;
  equidistant?: boolean;
  initialValue?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  mini?: boolean;
  hideBubble?: boolean;
  keyboardStep?: number;
  markerPosition?: (typeof MarkerPositions)[keyof typeof MarkerPositions];
  orientation?: "vertical" | "horizontal";
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  barStyles?: React.CSSProperties;
  fillStyles?: React.CSSProperties;
  grabberStyles?: React.CSSProperties;
  className?: string;
  barClassName?: string;
  grabberClassName?: string;
  onValueChange?: (value: number) => void;
  asValueChanges?: (value: number) => void;
  onValueRender?: (value: number) => string;
  onMarkerRender?: (value: number) => string;
  renderMarker?: (marker: number) => React.ReactElement;
  getAriaValueText?: (value: number) => void;
}

type SliderCompType = React.ComponentClass<SliderCompProps>;

const SliderComp = await waitForModule<Record<string, SliderCompType>>(
  filters.bySource(".moveGrabber="),
).then(
  (mod) => Object.values(mod).find((x) => x?.defaultProps && "stickToMarkers" in x.defaultProps)!,
);

interface SliderProps extends SliderCompProps {
  value?: number;
  onChange?: (value: number) => void;
}

export type SliderType = React.FC<SliderProps> & {
  MarkerPositions: typeof MarkerPositions;
};

export const Slider = ((props) => {
  return <SliderComp initialValue={props.value} onValueChange={props.onChange} {...props} />;
}) as SliderType;
Slider.MarkerPositions = MarkerPositions;

interface SliderItemProps extends SliderProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SliderItemType = React.FC<React.PropsWithChildren<SliderItemProps>>;

export const SliderItem = (props: React.PropsWithChildren<SliderItemProps>): React.ReactElement => {
  const { children, ...compProps } = props;
  return (
    <FormItem
      title={children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      noteStyle={{ marginBottom: props.markers ? 16 : 4 }}
      disabled={props.disabled}
      divider>
      <Slider {...compProps} />
    </FormItem>
  );
};
