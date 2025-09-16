import { classNames, marginStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
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

export function CustomSlider({ value, onChange, ...props }: CustomSliderProps): React.ReactElement {
  return <Slider initialValue={value} onValueChange={onChange} {...props} />;
}

interface SliderItemProps extends CustomSliderProps {
  note?: string;
  style?: React.CSSProperties;
}

export type SliderItemType = React.FC<React.PropsWithChildren<SliderItemProps>>;

export function SliderItem({
  children,
  className,
  style,
  note,
  ...props
}: React.PropsWithChildren<SliderItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={marginStyles.marginBottom20}
      style={style}
      note={note}
      noteClassName={props.markers ? marginStyles.marginBottom20 : marginStyles.marginBottom4}
      disabled={props.disabled}
      divider>
      <CustomSlider
        className={classNames({ [marginStyles.marginTop20]: props.markers && !note }, className)}
        {...props}
      />
    </FormItem>
  );
}
