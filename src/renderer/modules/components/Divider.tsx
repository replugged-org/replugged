import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";

interface DividerProps {
  className?: string;
  style?: React.CSSProperties;
}

export type DividerType = React.FC<DividerProps>;

export default getFunctionBySource<DividerType>(components, ".divider,")!;
