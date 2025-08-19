import { classNames, sharedStyles } from "@common";
import { getFunctionBySource } from "@webpack";
import type React from "react";
import { FormItem } from ".";
import components from "../common/components";

import type { SliderProps } from "discord-client-types/discord_app/design/components/Slider/web/Slider";
import type * as Design from "discord-client-types/discord_app/design/web";

const Slider = getFunctionBySource<typeof Design.Slider>(
  components,
  /initialValue!==\w+\.initialValueProp/,
)!;

interface CustomSliderProps extends SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}

export type CustomSliderType = React.FC<CustomSliderProps>;

export function CustomSlider(props: CustomSliderProps): React.ReactElement {
  return <Slider initialValue={props.value} onValueChange={props.onChange} {...props} />;
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
  ...restProps
}: React.PropsWithChildren<SliderItemProps>): React.ReactElement {
  return (
    <FormItem
      title={children}
      className={sharedStyles.MarginStyles.marginBottom20}
      style={style}
      note={note}
      noteClassName={
        restProps.markers
          ? sharedStyles.MarginStyles.marginBottom20
          : sharedStyles.MarginStyles.marginBottom4
      }
      disabled={restProps.disabled}
      divider>
      <CustomSlider
        className={classNames(
          { [sharedStyles.MarginStyles.marginTop20]: restProps.markers && !note },
          className,
        )}
        {...restProps}
      />
    </FormItem>
  );
}
