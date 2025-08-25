import type React from "react";
import components from "../common/components";
import { getFunctionBySource } from "@webpack";

interface ProgressProps {
  animate?: boolean;
  className?: string;
  itemClassName?: string;
  style?: React.CSSProperties;
  percent: number;
  foregroundGradientColor?: string[];
}

export type ProgressType = React.FC<ProgressProps>;
export default getFunctionBySource<ProgressType>(components, ".progressBar")!;
