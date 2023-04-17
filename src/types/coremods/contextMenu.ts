import ContextMenu from "../../renderer/modules/components/ContextMenu";
import { ReactComponent } from "../util";

const { MenuCheckboxItem, MenuControlItem, MenuGroup, MenuItem, MenuRadioItem, MenuSeparator } =
  ContextMenu;

export interface RawContextItem {
  type: ReactComponent<unknown>;
  children?: Array<RawContextItem | ContextItem | undefined>;
  action?(): unknown;

  [key: string]: unknown;
}

export type ContextItem =
  | typeof MenuSeparator
  | typeof MenuGroup
  | typeof MenuItem
  | typeof MenuCheckboxItem
  | typeof MenuRadioItem
  | typeof MenuControlItem;

export type GetContextItem = (
  data: Record<string, unknown>,
  menu: typeof ContextMenu.ContextMenu,
) => RawContextItem | ContextItem | undefined;

export type navId =
  | "channel-context"                     // right-click channel
  | "message"                             // right-click message
  | "user-context"                        // right-click user
  | "guild-context"                       // right-click guild icon
  | "guild-header-popout"                 // dropdown of a server's name
  | "account"                             // clicking on user icon in bottom-left
  | "user-settings-cog"                   // right-click settings
  | "audio-device-context"                // right-click mute of deafen buttons
  | "guild-browse-channels-context-menu"  // right-click browse channels
  | "dev-context"                         // right-click role
  | "gdm-context"                         // right-click group chat
  | "friend-row"                          // triple dots on user in home screen
  | "favorite-server-context"             // right-click favorites server
  | "thread-context"                      // right-click thread
  | "message-actions"                     // triple dots on message popover
  | "guild-settings-role-context"         // right-click role in guild settings
  | "expression-picker"                   // right-click emoji or sticker in the popout
  | "role-subscription-context"           // right-click server subscriptions
