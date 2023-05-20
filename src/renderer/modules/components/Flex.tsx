import type React from "react";
import { filters, waitForModule } from "../webpack";

interface FlexProps extends React.ComponentPropsWithoutRef<"div"> {
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  shrink?: number;
  grow?: number;
  basis?: string;
}

interface FlexChildProps extends React.ComponentPropsWithoutRef<"div"> {
  shrink?: number;
  grow?: number;
  basis?: string;
  wrap?: boolean;
}

export type FlexType = React.ComponentType<React.PropsWithChildren<FlexProps>> & {
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
  Child: React.ComponentType<React.PropsWithChildren<FlexChildProps>>;
};

const mod = await waitForModule(filters.bySource("HORIZONTAL_REVERSE:"));

export default mod as FlexType;
