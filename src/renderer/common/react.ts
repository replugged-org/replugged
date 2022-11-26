import { AnyFunction } from "../../types/util";
import { filters, getModule, waitForModule } from "../modules/webpack";

// @ts-expect-error - webpack exports are loaded async
let React: typeof import("react") & {
  reactReady: Promise<void>;
  jsx: AnyFunction;
  jsxs: AnyFunction;
} = {
  reactReady: waitForModule(
    filters.byProps("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"),
  ).then((react) => {
    Object.assign(React, react as typeof import("react"));
    React.jsx = (getModule(filters.byProps("jsx")) as { jsx: AnyFunction }).jsx;
    React.jsxs = React.jsx;
  }),
};

// ESBuild doesn't do binding for named exports (when not already defined.) Luckily this is a good hack.
const exports = Object.setPrototypeOf({}, React) as typeof React;

// @ts-expect-error - this is fine for now
export = exports;
