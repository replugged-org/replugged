import webpackCommon from "./modules/webpack-common";
import components_ from "./modules/components";

export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";
const { webpack } = require("./modules/webpack");
export { webpack };

// eslint-disable-next-line @typescript-eslint/no-floating-promises
webpackCommon().then((modules) => {
  webpack.common = modules;
});

/**
 * @see {@link Components}
 */
export let components = {};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
components_().then((modules) => {
  components = modules;
});

export { default as notices } from "./apis/notices";
export { default as commands } from "./apis/commands";
export { default as settings } from "./apis/settings";
/**
 * @internal
 * @hidden
 */
export * as coremods from "./managers/coremods";
/**
 * @internal Mostly for internal use, or within the console.
 */
export * as quickCSS from "./managers/quick-css";
/**
 * @internal Mostly for internal use, or within the console.
 */
export * as themes from "./managers/themes";
/**
 * @internal
 * @hidden
 */
export * as ignition from "./managers/ignition";
/**
 * @internal Mostly for internal use, or within the console.
 */
export * as plugins from "./managers/plugins";
export * from "../types";
