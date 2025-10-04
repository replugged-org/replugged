import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

import type * as Design from "discord-client-types/discord_app/design/web";

const Slider = getFunctionBySource<typeof Design.Slider>(
  components,
  /initialValue!==\i\.initialValueProp/,
)!;

interface CustomSliderProps extends Design.SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}

export type CustomSliderType = React.FC<CustomSliderProps>;

function CustomSlider({ value, onChange, ...props }: CustomSliderProps): React.ReactElement {
  return <Slider initialValue={value} onValueChange={onChange} {...props} />;
}

export default CustomSlider;
