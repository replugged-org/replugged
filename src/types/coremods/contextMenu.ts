import type { ContextMenuType, MenuProps } from "../../renderer/modules/components/ContextMenu";
import type React from "react";

type ContextMenuComponents = Omit<ContextMenuType, "ItemColors" | "ContextMenu">;

type RawContextMenuProps = {
  [K in keyof ContextMenuComponents]: React.ComponentProps<ContextMenuComponents[K]> & {
    type: ContextMenuComponents[K];
  };
};

type WithRawChildren<T> = T extends { children: React.ReactNode }
  ? Omit<T, "children"> & { children: RawContextItem | RawContextItem[] }
  : T;

export type RawContextItem<
  T extends
    RawContextMenuProps[keyof RawContextMenuProps] = RawContextMenuProps[keyof RawContextMenuProps],
> = WithRawChildren<T>;

export type GetContextItem<T extends Record<string, unknown> = Record<string, unknown>> = (
  data: T,
  menu: MenuProps,
) => RawContextItem | React.ReactElement | undefined | void;

/**
 * An enum for the navIds of context menus across Discord
 * @enum {string}
 */
export enum ContextMenuTypes {
  /** Click the user icon in the bottom left */
  Account = "account",
  ActivityShelfItemContext = "activity-shelf-item-context",
  AddQuestions = "add-questions",
  AppDetailsMoreMenu = "app-details-more-menu",
  ApplicationDirectoryProfile = "application-directory-profile",
  AttachmentLinkContext = "attachment-link-context",
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
  ChannelSummariesContextMenu = "channel-summaries-context-menu",
  ChannelNotificationCustomSettingsItems = "ChannelNotificationCustomSettingsItems",
  ClipsContext = "clips-context",
  ClipsMoreOptions = "clips-more-options",
  CommandListSort = "command-list-sort",
  ComponentButton = "component-button",
  ContentInventoryContext = "content-inventory-context",
  CopyId = "copy-id",
  Demo = "demo",
  /** Right-click a role */
  DevContext = "dev-context",
  DevtoolsOverflow = "devtools-overflow",
  DiscoveryEntrypointContextMenu = "discovery-entrypoint-context-menu",
  EditProfilePopout = "edit-profile-popout",
  ExitOptions = "exit-options",
  /** Right-click an emoji or sticker in the popout */
  ExpressionPicker = "expression-picker",
  /** Right-click the favorites server icon */
  FavoriteServerContext = "favorite-server-context",
  FavoritesHeaderPopout = "favorites-header-popout",
  ForumTag = "forum-tag",
  /** Click the triple dots icon for a user in the home screen */
  FriendRow = "friend-row",
  GameContext = "game-context",
  GameProfileContext = "game-profile-context",
  /** Right-click a group chat */
  GdmContext = "gdm-context",
  GlobalDiscoverySearchFilterOptions = "global-discovery-search-filter-options",
  GlobalDiscoveryTabsOverflowMenu = "global-discovery-tabs-overflow-menu",
  /** Right-click "Browse Channels" */
  GuildBrowseChannelsContextMenu = "guild-browse-channels-context-menu",
  /** Right-click guild icon */
  GuildContext = "guild-context",
  GuildDiscoveryContextMenu = "guild-discovery-context-menu",
  GuildEntryContext = "guild-entry-context",
  /** Dropdown under a server's name */
  GuildHeaderPopout = "guild-header-popout",
  GuildIntegrationsPermissionRoleContext = "guild-integrations-permission-role-context",
  GuildModerationRoles = "guild-moderation-roles",
  GuildProductContext = "guild-product-context",
  GuildRoleConnectionsContext = "guild-role-connections-context",
  /** Right-click a role in the guild settings */
  GuildSettingsRoleContext = "guild-settings-role-context",
  GuildShopContext = "guild-shop-context",
  ImageContextCommandPopout = "image-context-commands-popout",
  ImageContext = "image-context",
  JoinRequestGuildContext = "join-request-guild-context",
  LaunchContext = "launch-context",
  LeaderboardPopoutContextMenu = "leaderboard-popout-context-menu",
  ManageBroadcast = "manage-broadcast",
  ManageIntegration = "manage-integration",
  ManageMultiAccount = "manage-multi-account",
  ManageStreams = "manage-streams",
  MemberApplicationContextMenu = "member-application-context-menu",
  MemberApplicationsTabsOverflowMenu = "member-applications-tabs-overflow-menu",
  MemberListSettingsMenu = "member-list-settings-menu",
  MemberSafetyFlags = "member-safety-flags",
  MembersTableJoinMethodMenu = "members-table-join-method-menu",
  MembersTableSortMenu = "members-table-sort-menu",
  MentionsFilter = "mentions-filter",
  /** Click the triple dots on a message popover */
  MessageActions = "message-actions",
  MessageReminderCreate = "message-reminder-create",
  MessageReminderSnooze = "message-reminder-snooze",
  /** Right-click message */
  Message = "message",
  ModerationRaidContext = "moderation-raid-context",
  NonUserBotProfileOverflowMenu = "non-user-bot-profile-overflow-menu",
  NotificationActions = "notification-actions",
  NowPlayingMenu = "now-playing-menu",
  Overlay = "overlay",
  PipMenu = "pip-menu",
  PollMediaEditMenu = "poll-media-edit-menu",
  ProgressBarContext = "progress-bar-context",
  QuestsEntry = "quests-entry",
  RecentsNotifications = "recents-notifications",
  RecentsThreadNotifications = "recents-thread-notifications",
  /** Right-click "Server Subscriptions" */
  RoleSubscriptionContext = "role-subscription-context",
  RtcChannel = "rtc-channel",
  SearchResults = "search-results",
  SetImageForAction = "set-image-for-action",
  SetStatusSubmenuMobileWeb = "set-status-submenu-mobile-web",
  SetStatusSubmenu = "set-status-submenu",
  SignupButtonContext = "signup-button-context",
  SortAndView = "sort-and-view",
  SoundButtonContext = "sound-button-context",
  StaffHelpPopout = "staff-help-popout",
  StaffOnlyEntryDebug = "staff-only-entry-debug",
  StageChannelCallOverflowPopout = "stage-channel-call-overflow-popout",
  StatusMobileWeb = "status-mobile-web",
  StatusPicker = "status-picker",
  Status = "status",
  StreamContext = "stream-context",
  SubscriptionContext = "subscription-context",
  SwitchAccountsSubmenu = "switch-accounts-submenu",
  TestSkus = "test-skus",
  TestStoreListing = "test-store-listing",
  TextContext = "text-context",
  TextareaContext = "textarea-context",
  /** Right-click a thread */
  ThreadContext = "thread-context",
  TransferMenu = "transfer-menu",
  UnknownUserContext = "unknown-user-context",
  UserBotProfileAddApp = "user-bot-profile-add-app",
  UserBotProfileOverflowMenu = "user-bot-profile-overflow-menu",
  /** Right-click user */
  UserContext = "user-context",
  UserProfileActions = "user-profile-actions",
  UserProfileFriendRequestButtons = "user-profile-friend-request-buttons",
  UserProfileOverflowMenu = "user-profile-overflow-menu",
  UserSettingsChangeAvatar = "user-settings-change-avatar",
  /** Right-click settings */
  UserSettingsCog = "user-settings-cog",
  VideoBackgroundContext = "video-background-context",
  VideoDeviceContext = "video-device-context",
  WebauthnCredentialActions = "webauthn-credential-actions",
  WelcomeSettingsContext = "welcome-settings-context",
}
