import type { Channel, Message } from "discord-types/general";
import type { GetButtonItem, IconButtonProps } from "../../../types/coremods/message";
import { Logger } from "../../modules/logger";

const logger = Logger.api("MessagePopover");

export const buttons = new Map<GetButtonItem, string>();

/**
 * Adds a button to any MessagePopover
 * @param item The function that creates the button to add
 * @param key Optional key for button
 * @returns A callback to remove the button from set.
 */
export function addButton(item: GetButtonItem, key?: string): () => void {
  buttons.set(item, `${key || "repluggedButton"}-${Math.random().toString(36).substring(2)}`);

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
  IconButton: React.FC<IconButtonProps>,
): React.ReactElement[] {
  const items = [] as React.ReactElement[];

  buttons.forEach((key, getItem) => {
    try {
      const item = getItem(msg, channel);
      try {
        if (item) {
          item.key = key;
          items.push(<IconButton {...item} />);
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
