import { Channel, Message } from "discord-types/general";
import { Logger } from "../modules/logger";
import { ButtonItem, GetButtonItem } from "../../types/coremods/message";

const logger = Logger.api("MessagePopover");

export namespace MessagePopoverAPI {
  export const buttons = new Set<GetButtonItem>();

  /**
   * Adds a button to any MessagePopover
   * @param item The function that creates the button to add
   * @returns A callback to remove the button from set.
   */
  export function addButton(item: GetButtonItem): () => void {
    buttons.add(item);

    return () => removeButton(item);
  }

  /**
   * Removes a button from MessagePopover
   * @param item The function that creates the button to add
   * @returns
   */
  export function removeButton(item: GetButtonItem): void {
    buttons.delete(item);
  }

  /**
   * @internal
   * @hidden
   */
  export function _buildPopoverElements(
    msg: Message,
    channel: Channel,
    makeButton: (item: ButtonItem) => React.ComponentType,
  ): React.ComponentType[] {
    const items = [] as React.ComponentType[];

    buttons.forEach((getItem) => {
      try {
        const item = getItem(msg, channel);
        try {
          if (item) {
            item.message ??= msg;
            item.channel ??= channel;
            items.push(makeButton(item));
          }
        } catch (err) {
          logger.error(`Error in making the button [${item?.key}]`, err, item);
        }
      } catch (err) {
        logger.error("Error while running GetButtonItem function", err, getItem);
      }
    });

    return items;
  }
}
