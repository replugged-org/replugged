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

export type FlexType = React.FC<React.PropsWithChildren<FlexProps>> & {
  defaultProps: FlexProps;
  Direction: Record<"HORIZONTAL" | "HORIZONTAL_REVERSE" | "VERTICAL", string>;
  Align: Record<"BASELINE" | "CENTER" | "END" | "START" | "STRETCH", string>;
  Justify: Record<"AROUND" | "BETWEEN" | "CENTER" | "END" | "START", string>;
  Wrap: Record<"WRAP" | "NO_WRAP" | "WRAP_REVERSE", string>;
  Child: React.FC<React.PropsWithChildren<FlexChildProps>> & {
    defaultProps: FlexChildProps;
  };
};

export default await waitForModule<FlexType>(
  filters.bySource(/HORIZONTAL_REVERSE:\w+?\.horizontalReverse./),
);
