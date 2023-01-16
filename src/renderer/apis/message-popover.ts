import { Channel, Message } from "discord-types/general";
import { Logger } from "../modules/logger";
import { ButtonItem, getButtonItem } from "../../types/coremods/message";

const logger = Logger.api("MessagePopover");

export class MessagePopoverAPI extends EventTarget {
  public buttons = new Map<string, getButtonItem>();

  public addButton(identifier: string, item: getButtonItem): void {
    this.buttons.set(identifier, item);
  }

  public removeButton(identifier: string): void {
    this.buttons.delete(identifier);
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

    for (const [identifier, getItem] of this.buttons.entries()) {
      try {
        const item = getItem(msg, channel);
        if (item) {
          item.key ??= identifier;
          item.message ??= msg;
          item.channel ??= channel;
          items.push(makeButton(item));
        }
      } catch (err) {
        logger.error(`[${identifier}]`, err);
      }
    }

    return items;
  }
}
