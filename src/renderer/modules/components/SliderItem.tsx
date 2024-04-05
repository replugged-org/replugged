import type React from "react";
import { FormItem } from ".";
import components from "../common/components";
import { waitForProps } from "../webpack";

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

export type SliderCompType = React.ComponentClass<SliderCompProps>;

const SliderComp = components.Slider;

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

const classes = await waitForProps<Record<"marginTop20", string>>("marginTop20");

interface SliderItemProps extends SliderProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SliderItemType = React.FC<React.PropsWithChildren<SliderItemProps>>;

export const SliderItem = (props: React.PropsWithChildren<SliderItemProps>): React.ReactElement => {
  const { children, className, ...compProps } = props;
  return (
    <FormItem
      title={children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      noteStyle={{ marginBottom: props.markers ? 16 : 4 }}
      disabled={props.disabled}
      divider>
      <Slider
        className={`${props.markers && !props.note ? classes.marginTop20 : ""}${
          className ? ` ${className}` : ""
        }`}
        {...compProps}
      />
    </FormItem>
  );
};
