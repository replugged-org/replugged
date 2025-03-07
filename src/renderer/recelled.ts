// We Bundle it anyways so for reference and even plugin use this would be nice to be have.
export * as Intl from "@discord/intl";

export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";

/**
 * The logger module provides a convenient and consistent way to associate things printed to the console
 * with their origin. This makes it easier to associate console messages with their origins, which can
 * simplify filtering items in the console and diagnosing issues.
 *
 * Messages printed using this module will be prefixed with a colorful string
 * in the following format: `[ReCelled:Type:Name]`
 *
 * - The color of the prefix is blurple by default, but this can be customized.
 * - The "Type" portion of the prefix indicates the type of the message's origin--e.g. an API, a coremod, or a plugin.
 * - The "Name" portion of the prefix specifies the origin of the message--the name of the API/coremod/plugin.
 */
export * as logger from "./modules/logger";
export { Logger } from "./modules/logger";

export * as webpack from "./modules/webpack";
export * as common from "./modules/common";
export * as components from "./modules/components";
export * as i18n from "./modules/i18n";

export { default as notices } from "./apis/notices";
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

/**
 * @internal
 */
export * as updater from "./managers/updater";

export * as util from "./util";

export * as types from "../types";
