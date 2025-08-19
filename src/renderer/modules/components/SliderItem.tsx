import { classNames } from "@common";
import { getFunctionBySource, waitForProps } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type { SliderProps } from "discord-client-types/discord_app/design/components/Slider/web/Slider";
import type * as Design from "discord-client-types/discord_app/design/web";
import type { MarginStyles } from "discord-client-types/discord_app/styles/shared/Margin.module";

const Slider = getFunctionBySource<typeof Design.Slider>(
  components,
  /initialValue!==\w+\.initialValueProp/,
)!;

interface CustomSliderProps extends SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}

export type CustomSliderType = React.FC<CustomSliderProps>;

export const CustomSlider = (props: CustomSliderProps): React.ReactElement => {
  return <Slider initialValue={props.value} onValueChange={props.onChange} {...props} />;
};

const classes = await waitForProps<Record<MarginStyles, string>>("marginTop20");

interface SliderItemProps extends CustomSliderProps {
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
      <CustomSlider
        className={classNames({ [classes.marginTop20]: props.markers && !props.note }, className)}
        {...compProps}
      />
    </FormItem>
  );
};
