/**
 * The logger module provides a convenient and consistent way to associate things printed to the console
 * with their origin. This makes it easier to associate console messages with their origins, which can
 * simplify filtering items in the console and diagnosing issues.
 *
 * Messages printed using this module will be prefixed with a colorful string
 * in the following format: `[Replugged:Type:Name]`
 *
 * - The color of the prefix is blurple by default, but this can be customized.
 * - The "Type" portion of the prefix indicates the type of the message's origin--e.g. an API, a coremod, or a plugin.
 * - The "Name" portion of the prefix specifies the origin of the message--the name of the API/coremod/plugin.
 */
export * as logger from "./modules/logger";
export { Logger } from "./modules/logger";

export * as settings from "./apis/settings";

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

export * as util from "./util";

export * as types from "../types";
