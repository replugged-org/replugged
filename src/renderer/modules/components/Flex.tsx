import type React from "react";
import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type FlexType = ReactComponent<{
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  shrink?: number;
  grow?: number;
  basis?: string;
  style?: React.CSSProperties;
  className?: string;
}> & {
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
  Child: ReactComponent<{
    shrink?: number;
    grow?: number;
    basis?: string;
    wrap?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }>;
};

const mod = await waitForModule(filters.bySource("HORIZONTAL_REVERSE:"));

export default mod as FlexType;
