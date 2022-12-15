import * as webpackModule from "./modules/webpack";
import webpackCommon, { CommonModules } from "./modules/webpack-common";

export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";
export namespace webpack {
  /**
   * @see {@link CommonModules}
   */
  export let common: CommonModules = null as unknown as CommonModules;

  export namespace filters {
    export const {
      /**
       * Get a module that has all the given properties on one of its exports
       * @param props List of property names
       */
      byProps,

      /**
       * Get a module whose source code matches the given string or RegExp
       * @param match String or RegExp to match in the module's source code
       *
       * @remarks
       * This function matches on the minified code, so make sure to keep that in mind when writing your strings/RegExp.
       *
       * Randomized variable names (usually 1-2 letters) are not stable between Discord updates. Make sure to use wildcards to make sure your RegExp matches if the variable name were to.
       */ bySource,
    } = webpackModule.filters;
  }

  export const {
    /**
     * @internal
     * @hidden
     */
    waitForReady,
    /**
     * @internal
     * @hidden
     */
    waitForStart,
    /**
     * @internal
     * @hidden
     */
    signalStart,

    getById,
    getByProps,
    getBySource,
    getModule,
    getExportsForProps,
    getFunctionBySource,
    patchPlaintext,
    waitForModule,
  } = webpackModule;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
webpackCommon().then((modules) => {
  webpack.common = modules;
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
