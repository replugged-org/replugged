import * as webpackModule from "./modules/webpack";
import webpackCommon, { CommonModules } from "./modules/webpack-common";
import components_, { Components } from './modules/components';

export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";

export const webpack = {
  ...webpackModule,
  common: null as unknown as CommonModules,
};

export let components = null as unknown as Components;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
webpackCommon().then((modules) => {
  webpack.common = modules;
});
components_().then((modules) => {
  components = modules;
})
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
