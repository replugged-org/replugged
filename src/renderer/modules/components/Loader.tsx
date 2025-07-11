import { getFunctionBySource } from "@webpack";
import type React from "react";
import type { ScreamingSnakeCase } from "type-fest";
import components from "../common/components";

type Types =
  | "wanderingCubes"
  | "chasingDots"
  | "pulsingEllipsis"
  | "spinningCircle"
  | "spinningCircleSimple"
  | "lowMotion";

export type LoaderTypes = {
  [K in Types as ScreamingSnakeCase<K>]: K;
};

interface CommonLoaderProps {
  type?: Types;
  animated?: boolean;
  itemClassName?: string;
}

interface SpinningCircleProps extends CommonLoaderProps, React.ComponentPropsWithoutRef<"div"> {
  type?: Extract<Types, "spinningCircle" | "spinningCircleSimple">;
}
interface OtherLoaderProps extends CommonLoaderProps, React.ComponentPropsWithoutRef<"span"> {
  type?: Exclude<Types, "spinningCircle" | "spinningCircleSimple">;
}

export type LoaderType = React.FC<SpinningCircleProps | OtherLoaderProps> & {
  Type: LoaderTypes;
};

export default getFunctionBySource<LoaderType>(components, "wanderingCubes")!;
