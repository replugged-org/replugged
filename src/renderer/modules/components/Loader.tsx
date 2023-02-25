import type React from "react";
import { filters, waitForModule } from "../webpack";

const TYPES = {
  WANDERING_CUBES: "wanderingCubes",
  CHASING_DOTS: "chasingDots",
  PULSING_ELLIPSIS: "pulsingEllipsis",
  SPINNING_CIRCLE: "spinningCircle",
  LOW_MOTION: "lowMotion",
} as const;

interface LoaderProps {
  type?: (typeof TYPES)[keyof typeof TYPES];
  animated?: boolean;
  className?: string;
  itemClassName?: string;
  "aria-label"?: string;
  style?: React.CSSProperties;
}

export type LoaderType = React.ComponentType<LoaderProps> & {
  Type: typeof TYPES;
};

const Loader = (await waitForModule(filters.bySource('"wanderingCubes"')).then((mod) =>
  Object.values(mod).find((x) => typeof x === "function"),
)) as LoaderType;

export default Loader;
