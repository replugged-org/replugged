import type React from "react";
import components from "../common/components";

const Types = {
  WANDERING_CUBES: "wanderingCubes",
  CHASING_DOTS: "chasingDots",
  PULSING_ELLIPSIS: "pulsingEllipsis",
  SPINNING_CIRCLE: "spinningCircle",
  SPINNING_CIRCLE_SIMPLE: "spinningCircleSimple",
  LOW_MOTION: "lowMotion",
} as const;

interface GenericLoaderProps {
  animated?: boolean;
  itemClassName?: string;
}

type LoaderProps = GenericLoaderProps & {
  type?: (typeof Types)[keyof typeof Types];
} & React.ComponentPropsWithoutRef<"span">;
type SpinningCircleLoaderProps = GenericLoaderProps & {
  type?: (typeof Types)["SPINNING_CIRCLE"] | (typeof Types)["SPINNING_CIRCLE_SIMPLE"];
} & React.ComponentPropsWithoutRef<"div">;

export type LoaderType = React.FC<LoaderProps | SpinningCircleLoaderProps> & {
  Type: typeof Types;
};

export default components.Spinner;
