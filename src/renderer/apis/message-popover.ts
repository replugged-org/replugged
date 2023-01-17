import { Channel, Message } from "discord-types/general";
import { Logger } from "../modules/logger";
import { ButtonItem, GetButtonItem } from "../../types/coremods/message";

const logger = Logger.api("MessagePopover");

export class MessagePopoverAPI extends EventTarget {
  public buttons = new Set<GetButtonItem>();

  /**
   * Adds a button to any MessagePopover
   * @param item The function that creates the button to add
   * @returns A callback to remove the button from set.
   */  
  public addButton(item: GetButtonItem): () => void {
    this.buttons.add(item);
    
    return () => this.buttons.delete(item)
  }

  /**
   * Removes a button from MessagePopover
   * @param item The function that creates the button to add
   * @returns
   */  
  public removeButton(item: GetButtonItem): void {
    this.buttons.delete(item);
  }

  /**
   * @internal
   * @hidden
   */
  public _buildPopoverElements(
    msg: Message,
    channel: Channel,
    makeButton: (item: ButtonItem) => React.ComponentType,
  ): React.ComponentType[] {
    const items = [] as React.ComponentType[];

    this.buttons.forEach(getItem => {
      try {
        const item = getItem(msg, channel);
        try {
          if (item) {
            item.message ??= msg;
            item.channel ??= channel;
            items.push(makeButton(item));
          }
        } catch (err) {
          logger.error(`Error in making the button [${item?.key}]`, err)
        }
      } catch (err) {
        logger.error("The GetButtonItem button submitted has an error.", err);
      }
    });

    return items;
  }
}
