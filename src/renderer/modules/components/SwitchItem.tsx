import { filters, getFunctionBySource, waitForModule } from "@webpack";
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
  containerRef?: React.Ref<HTMLDivElement>;
}

export type SwitchItemType = React.FC<React.PropsWithChildren<SwitchItemProps>>;

const switchString = "xMinYMid meet";
const mod = await waitForModule(filters.bySource(switchString));

export const Switch = getFunctionBySource<SwitchType>(mod, switchString)!;

export const SwitchItem = getFunctionBySource<SwitchItemType>(
  components,
  /hideBorder:\w+=!1,tooltipNote:\w+,onChange/,
)!;
