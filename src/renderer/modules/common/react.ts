import { byPropsFilter, waitFor } from "../webpack";

// @ts-expect-error - webpack exports are loaded async
let React: typeof import("react") & { reactReady: Promise<void> } = {
  reactReady: waitFor(
    byPropsFilter(["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"]),
  ).then((react) => {
    Object.assign(React, react as typeof import("react"));
  }),
};

export = React;
