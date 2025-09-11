import { filters, waitForModule } from "@webpack";
import type React from "react";

interface FlexProps extends React.ComponentPropsWithoutRef<"div"> {
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  shrink?: React.CSSProperties["flexShrink"];
  grow?: React.CSSProperties["flexGrow"];
  basis?: React.CSSProperties["flexBasis"];
}

interface FlexChildProps extends React.ComponentPropsWithoutRef<"div"> {
  shrink?: React.CSSProperties["flexShrink"];
  grow?: React.CSSProperties["flexGrow"];
  basis?: React.CSSProperties["flexBasis"];
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
