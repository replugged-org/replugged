import { filters, waitForModule } from "../webpack";

type Value = string | number | boolean | undefined | null;
type Mapping = Record<string, unknown>;
type ArgumentArray = Argument[];
type ReadonlyArgumentArray = readonly Argument[];
type Argument = Value | Mapping | ArgumentArray | ReadonlyArgumentArray;

export type ClassNames = (...args: ArgumentArray) => string;

export default await waitForModule<ClassNames>(filters.bySource("window.classNames="));
