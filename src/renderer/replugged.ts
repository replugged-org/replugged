// We can't use export * as React from "./react" because it's not compatiable with export = X
import React from "./common/react";
export { React };

export * as injector from "./modules/injector";
export * as webpack from "./modules/webpack";
export { default as notices } from "./apis/notices";
export { default as commands } from "./apis/commands";
export { default as settings } from "./apis/settings";
export * as coremods from "./managers/coremods";
export * as quickCSS from "./managers/quick-css";
export * as themes from "./managers/themes";
export * as ignition from "./managers/ignition";
export * as plugins from "./managers/plugins";
