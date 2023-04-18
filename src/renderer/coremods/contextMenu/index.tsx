import type {
  ContextItem,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { Logger } from "../../modules/logger";
import { getByProps } from "../../modules/webpack";
import type ReactType from "react";

const logger = Logger.api("ContextMenu");

/**
 * An enum for the navIds of context menus across discord
 * @enum {string}
 */
export enum navIds {
  /** Clicking the  user icon in the bottom left */
  Account = "account",
  AddQuestions = "add-questions",
  ApplicationDirectoryProfile = "application-directory-profile",
  /** Right-click mute or deafen buttons */
  AudioDeviceContext = "audio-device-context",
  AutomodRuleContext = "automod-rule-context",
  ChannelAttach = "channel-attach",
  ChannelAutocomplete = "channel-autocomplete",
  ChannelCallOverflowPopout = "channel-call-overflow-popout",
  /** Right-click channel */
  ChannelContext = "channel-context",
  /** Right-click a channel mention */
  ChannelMentionContext = "channel-mention-context",
  ComponentButton = "component-button",
  CopyId = "copy-id",
  /** Right-click a role */
  DevContext = "dev-context",
  DevtoolsOverflow = "devtools-overflow",
  EditProfilePopout = "edit-profile-popout",
  ExitOptions = "exit-options",
  /** Right-click an emoji or sticker in the popout */
  ExpressionPicker = "expression-picker",
  /** Right-click the favorites server icon */
  FavoriteServerContext = "favorite-server-context",
  FavoritesHeaderPopout = "favorites-header-popout",
  /** Click the triple dots icon for a user in the home screen */
  FriendRow = "friend-row",
  GameContext = "game-context",
  /** Right click a group chat */
  GdmContext = "gdm-context",
  /** Right-click "Browse Channels" */
  GuildBrowseChannelsContextMenu = "guild-browse-channels-context-menu",
  /** Right-click guild icon */
  GuildContext = "guild-context",
  GuildDiscoveryContextMenu = "guild-discovery-context-menu",
  GuildEntryContext = "guild-entry-context",
  /** Dropdown under a server's name */
  GuildHeaderPopout = "guild-header-popout",
  GuildIntegrationsPermissionRoleContext = "guild-integrations-permission-role-context",
  GuildRoleConnectionsContext = "guild-role-connections-context",
  /** Right-click a role in the guild settings */
  GuildSettingsRoleContext = "guild-settings-role-context",
  ImageContext = "image-context",
  JoinRequestGuildContext = "join-request-guild-context",
  LaunchContext = "launch-context",
  ManageIntegration = "manage-integration",
  ManageMultiAccount = "manage-multi-account",
  ManageStreams = "manage-streams",
  MemberApplicationContextMenu = "member-application-context-menu",
  MentionsFilter = "mentions-filter",
  /** right-click message */
  Message = "message",
  /** Click the triple dots on a message popover */
  MessageActions = "message-actions",
  ModerationRaidContext = "moderation-raid-context",
  NotificationActions = "notification-actions",
  NowPlayingMenu = "now-playing-menu",
  Overlay = "overlay",
  PipMenu = "pip-menu",
  ProgressBarContext = "progress-bar-context",
  RecentsNotifications = "recents-notifications",
  RecentsThreadNotifications = "recents-thread-notifications",
  /** Right-click "Server Subscriptions" */
  RoleSubscriptionContext = "role-subscription-context",
  RtcChannel = "rtc-channel",
  SearchResults = "search-results",
  SortAndView = "sort-and-view",
  SoundButtonContext = "sound-button-context",
  StaffHelpPopout = "staff-help-popout",
  StageChannelCallOverflowPopout = "stage-channel-call-overflow-popout",
  StatusPicker = "status-picker",
  StreamContext = "stream-context",
  SubscriptionContext = "subscription-context",
  TestSkus = "test-skus",
  TestStoreListing = "test-store-listing",
  TextContext = "text-context",
  TextareaContext = "textarea-context",
  /** Right-click a thread */
  ThreadContext = "thread-context",
  TransferMenu = "transfer-menu",
  /** Right-click user */
  UserContext = "user-context",
  UserProfileActions = "user-profile-actions",
  /** Right-click settings */
  UserSettingsCog = "user-settings-cog",
  VideoBackgroundContext = "video-background-context",
  VideoDeviceContext = "video-device-context",
  WebauthnCredentialActions = "webauthn-credential-actions",
  WelcomeSettingsContext = "welcome-settings-context",
}

export const menuItems = {} as Record<navIds, GetContextItem[]>;

/**
 * Converts data into a react element. Any elements or falsy value will be returned as is
 * @param raw The data to convert
 * @returns The converted item
 */
function makeItem(raw: RawContextItem | ContextItem | undefined): ContextItem | undefined {
  // Importing React at the top of the file causes an import loop that hangs discord
  const React = getByProps(
    "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
    "createElement",
    "isValidElement",
  ) as unknown as typeof ReactType;

  if (!raw) {
    // If something falsy is passed, let it through
    // Discord just skips over them too
    return raw;
  }
  if (React.isValidElement(raw)) {
    // We can't construct something that's already made
    return raw as unknown as ContextItem;
  }

  raw = raw as RawContextItem;

  const { type, ...props } = raw;
  if (props.children) {
    props.children = props.children.map((child: RawContextItem | ContextItem | undefined) =>
      makeItem(child),
    );
  }

  return React.createElement(type, props as Record<string, unknown>) as unknown as ContextItem;
}

/**
 * Add an item to any context menu
 * @param navId The id of the menu you want to insert to
 * @param getItem A function that creates and returns the menu item
 * @returns A callback to de-register the function
 */
export function addContextMenuItem(navId: navIds, getItem: GetContextItem): () => void {
  if (!menuItems[navId]) menuItems[navId] = [];

  menuItems[navId].push(getItem);
  return () => removeContextMenuItem(navId, getItem);
}

/**
 * Remove an item from a context menu
 * @param navId The id of the menu the function was registered to
 * @param getItem The function to remove
 * @returns
 */
export function removeContextMenuItem(navId: navIds, getItem: GetContextItem): void {
  const items = menuItems[navId];
  const index = items.indexOf(getItem);

  if (index === -1) {
    // Already removed
    return;
  }

  items.splice(index, 1);
}

/**
 * @internal
 * @hidden
 */
export function _insertMenuItems(menu: {
  data: { 0: Record<string, unknown> };
  navId: navIds;
  children: JSX.Element[];
}): void {
  const { navId } = menu;
  console.log(navId);

  // No items to insert
  if (!menuItems[navId]) return;

  // Already inserted items
  // If this isn't here, another group of items is added every update
  if (menu.children.at(-2)?.props?.name === "replugged") return;

  // We delay getting the items until now, as importing at the start of the file causes discord to hang
  // Using `await import(...)` is undesirable because the new items will only appear once the menu is interacted with
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
  const { ContextMenu, MenuGroup } = getByProps(["Menu", "MenuItem", "MenuGroup"]) as any;

  // The data as passed as Arguments from the calling function, so we just grab what we want from it
  const data = menu.data[0];

  const repluggedGroup = <MenuGroup></MenuGroup>;
  repluggedGroup.props.name = "replugged";
  repluggedGroup.props.children = [];

  menuItems[navId].forEach((getItem) => {
    try {
      repluggedGroup.props.children.push(
        makeItem(getItem(data, menu as unknown as typeof ContextMenu)),
      );
    } catch (err) {
      logger.error("Error while running GetContextItem function", err, getItem);
    }
  });

  // Add in the new menu items right above the DevMode Copy ID
  // If the user doesn't have DevMode enabled, the new items will be at the bottom
  menu.children.splice(-1, 0, repluggedGroup);
}
