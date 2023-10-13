import type React from "react";
import { filters, waitForModule } from "../webpack";

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
  className?: string;
  itemClassName?: string;
  style?: React.CSSProperties;
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

const Loader = await waitForModule<Record<string, LoaderType>>(
  filters.bySource('"wanderingCubes"'),
).then((mod) => Object.values(mod).find((x) => typeof x === "function")!);

export default Loader;
