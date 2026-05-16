import { filters, waitForModule } from "@webpack";
import type React from "react";

import type * as Design from "discord-client-types/discord_app/design/web";

const sliderRegex = /initialValue!==\i\.initialValueProp/;
const Slider = await waitForModule<typeof Design.Slider>(filters.bySource(sliderRegex));

interface CustomSliderProps extends Design.SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}

export type CustomSliderType = React.FC<CustomSliderProps>;

function CustomSlider({ value, onChange, ...props }: CustomSliderProps): React.ReactElement {
  return <Slider initialValue={value} onValueChange={onChange} {...props} />;
}

export default CustomSlider;
