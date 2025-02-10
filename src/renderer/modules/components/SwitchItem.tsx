import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

interface SwitchProps {
  checked?: boolean;
  onChange?: (value: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  innerRef?: React.Ref<HTMLInputElement>;
  focusProps?: Record<string, unknown>;
  className?: string;
}

export type SwitchType = React.FC<SwitchProps>;

interface SwitchItemProps {
  value?: boolean;
  onChange?: (value: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  note?: React.ReactNode;
  tooltipNote?: string;
  disabled?: boolean;
  disabledText?: string;
  hideBorder?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export type SwitchItemType = React.FC<React.PropsWithChildren<SwitchItemProps>>;

const getSwitchItem = async (): Promise<{ Switch: SwitchType; SwitchItem: SwitchItemType }> => ({
  Switch: getFunctionBySource<SwitchType>(await components, "xMinYMid meet")!,
  SwitchItem: getFunctionBySource<SwitchItemType>(
    await components,
    /hideBorder:\w+=!1,tooltipNote:\w+,onChange/,
  )!,
});

export default getSwitchItem();
