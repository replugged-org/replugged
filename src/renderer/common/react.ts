import { AnyFunction } from "../../types/util";
import { byPropsFilter, getByProps, waitFor } from "../modules/webpack";

// @ts-expect-error - webpack exports are loaded async
let React: typeof import("react") & {
  reactReady: Promise<void>;
  jsx: AnyFunction;
  jsxs: AnyFunction;
} = {
  reactReady: waitFor(
    byPropsFilter(["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"]),
  ).then((react) => {
    Object.assign(React, react as typeof import("react"));
    React.jsx = getByProps("jsx")?.jsx as AnyFunction;
    React.jsxs = React.jsx;
  }),
};

// ESBuild doesn't do binding for named exports (when not already defined.) Luckily this is a good hack.
const exports = Object.setPrototypeOf({}, React) as typeof React;

export = exports;
