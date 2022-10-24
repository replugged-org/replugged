import { byPropsFilter, waitFor } from "../webpack";

let React: typeof import("react");

export const reactReady = waitFor(
  byPropsFilter(["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"]),
).then((react) => (React = react as typeof import("react")));

export { React as default };
