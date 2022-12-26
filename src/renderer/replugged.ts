export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";

export * as logger from "./modules/logger";
export { Logger } from "./modules/logger";

export * as webpack from "./modules/webpack";
export let common: typeof import("./modules/webpack/common");
void import("./modules/webpack/common").then((c) => (common = c));

export let components: typeof import("./modules/components");
void import("./modules/components").then((c) => (components = c));

export { default as notices } from "./apis/notices";
export { default as commands } from "./apis/commands";
export * as settings from "./apis/settings";
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

export * as util from "./util";

export * as types from "../types";
