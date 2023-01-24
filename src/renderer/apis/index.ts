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
 *       // do stuff here when someone leftclicks the button
 *     },
 *     onContextMenu: () => {
 *       // do other stuff here when someone rightclicks the button
 *     },
 *   };
 * };
 *
 * function start() {
 *   removeButton = api.messagePopover.addButton(item, "optionaluniquekeyhere");
 * }
 *
 * function stop() {
 *   removeButton();
 *   // or you can use
 *   // api.messagePopover.removeButton(item)
 * }
 * ```
 */
export * as messagePopover from "./message-popover";
