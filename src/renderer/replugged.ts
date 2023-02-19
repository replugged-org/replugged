export * as injector from "./modules/injector";
export { Injector } from "./modules/injector";

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

export * as webpack from "./modules/webpack";
export * as common from "./modules/common";
export * as components from "./modules/components";
export * as i18n from "./modules/i18n";

export { default as notices } from "./apis/notices";
export { default as commands } from "./apis/commands";
export * as settings from "./apis/settings";

/**
 * A quick method to add a button to any message popover.
 * @param item The function that creates the button to add
 * @returns Uninject Function.
 *
 * @example
 * ```
 * import { api, types } from "replugged";
 *
 * let removeButton;
 * let item: types.GetButtonItem = (msg: Message, channel: Channel) => {
 *   return {
 *     label: "Click the button!",
 *     icon: <svg></svg>, // Cool icon
 *     onClick: () => {
 *       // do stuff here when someone left clicks the button
 *     },
 *     onContextMenu: () => {
 *       // do other stuff here when someone right clicks the button
 *     },
 *   };
 * };
 *
 * function start() {
 *   removeButton = api.messagePopover.addButton(item, "optional unique key here");
 * }
 *
 * function stop() {
 *   removeButton();
 *   // or you can use
 *   // api.messagePopover.removeButton(item)
 * }
 * ```
 */
export * as messagePopover from "./apis/message-popover";

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
