import type React from "react";
import type { CustomContextMenuType } from "../../renderer/modules/components/Menu";

import type { MenuProps } from "discord-client-types/discord_app/design/components/Menu/web/Menu";

type ContextMenuComponents = Omit<CustomContextMenuType, "ItemColors" | "ContextMenu">;

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
  ActivityPopoutOverflowPopout = "activity-popout-overflow-popout",
  ActivityShelfItemContext = "activity-shelf-item-context",
  AddQuestions = "add-questions",
  AppDetailsMoreMenu = "app-details-more-menu",
  ApplicationDirectoryProfile = "application-directory-profile",
  AttachmentLinkContext = "attachment-link-context",
  /** Right-click mute or deafen buttons */
  AudioDeviceContext = "audio-device-context",
  AuthorizedAppActionMenu = "authorized-app-action-menu",
  AutomodRuleContext = "automod-rule-context",
  ChannelAttach = "channel-attach",
  ChannelAutocomplete = "channel-autocomplete",
  /** Right-click channel */
  ChannelContext = "channel-context",
  /** Right-click a channel mention */
  ChannelMentionContext = "channel-mention-context",
  ChannelSummariesContextMenu = "channel-summaries-context-menu",
  ChannelNotificationCustomSettingsItems = "ChannelNotificationCustomSettingsItems",
  ClipsContext = "clips-context",
  ClipsFiltersContext = "clips-filters-context",
  ClipsMoreOptions = "clips-more-options",
  CollectiblesIndexPageMenu = "collectibles-index-page-menu",
  CollectiblesShopTabsOverflowMenu = "collectibles-shop-tabs-overflow-menu",
  CommandListSort = "command-list-sort",
  ComponentButton = "component-button",
  CopyId = "copy-id",
  /** Right-click a role */
  DevContext = "dev-context",
  DevtoolsOverflow = "devtools-overflow",
  DevtoolsPopout = "devtools-popout",
  DownloadAppMenu = "download-app-menu",
  EditProfilePopout = "edit-profile-popout",
  EmojiStudioContextMenu = "emoji-studio-context-menu",
  ExitOptions = "exit-options",
  /** Right-click an emoji or sticker in the popout */
  ExpressionPicker = "expression-picker",
  /** Right-click the favorites server icon */
  FavoriteServerContext = "favorite-server-context",
  FavoritesHeaderPopout = "favorites-header-popout",
  ForumTag = "forum-tag",
  /** Click the triple dots icon for a user in the home screen */
  FriendRow = "friend-row",
  GameServerPopoutContextMenu = "game_server-popout-context-menu",
  GameContext = "game-context",
  GameProfileContext = "game-profile-context",
  GameShopContext = "game-shop-context",
  /** Right-click a group chat */
  GdmContext = "gdm-context",
  GlobalDiscoverySearchFilterOptions = "global-discovery-search-filter-options",
  GlobalDiscoveryTabsOverflowMenu = "global-discovery-tabs-overflow-menu",
  GroupContextMenu = "group-context-menu",
  /** Right-click "Browse Channels" */
  GuildBrowseChannelsContextMenu = "guild-browse-channels-context-menu",
  /** Right-click guild icon */
  GuildContext = "guild-context",
  GuildDiscoveryContextMenu = "guild-discovery-context-menu",
  GuildEntryContext = "guild-entry-context",
  GuildEventImageContext = "guild-event-image-context",
  /** Dropdown under a server's name */
  GuildHeaderPopout = "guild-header-popout",
  GuildIntegrationsPermissionRoleContext = "guild-integrations-permission-role-context",
  GuildModerationRoles = "guild-moderation-roles",
  GuildOnboardingSplashContext = "guild-onboarding-splash-context",
  GuildProductContext = "guild-product-context",
  GuildRoleConnectionsContext = "guild-role-connections-context",
  /** Right-click a role in the guild settings */
  GuildSettingsRoleContext = "guild-settings-role-context",
  GuildShopContext = "guild-shop-context",
  ImageContext = "image-context",
  ImageMenu = "image-menu",
  InviteRolesMenu = "invite-roles-menu",
  JoinRequestGuildContext = "join-request-guild-context",
  LaunchContext = "launch-context",
  ManageMultiAccount = "manage-multi-account",
  ManageStreams = "manage-streams",
  MemberApplicationContextMenu = "member-application-context-menu",
  MemberListSettingsMenu = "member-list-settings-menu",
  MemberSafetyFlags = "member-safety-flags",
  MembersTableJoinMethodMenu = "members-table-join-method-menu",
  MembersTableSortMenu = "members-table-sort-menu",
  MembersTabsOverflowMenu = "members-tabs-overflow-menu",
  MentionsFilter = "mentions-filter",
  MenuStory = "menu-story",
  /** Click the triple dots on a message popover */
  MessageActions = "message-actions",
  MessageReminderCreate = "message-reminder-create",
  /** Right-click message */
  Message = "message",
  ModerationRaidContext = "moderation-raid-context",
  MoreSettingsContext = "more-settings-context",
  NonUserBotProfileOverflowMenu = "non-user-bot-profile-overflow-menu",
  NotificationActions = "notification-actions",
  NotificationsInboxMessageContext = "notifications-inbox-message-context",
  NowPlayingMenu = "now-playing-menu",
  OverlayChannelContext = "overlay-channel-context",
  OverlayClickZoneDebugContextMenu = "overlay-click-zone-debug-context-menu",
  OverlayGdmContext = "overlay-gdm-context",
  OverlayGoLiveWidgetContextMenu = "overlay-go-live-widget-context-menu",
  OverlayGroupContextMenu = "overlay-group-context-menu",
  OverlayNotificationsWidgetContextMenu = "overlay-notifications-widget-context-menu",
  OverlayReportToModChannelContext = "overlay-report-to-mod-channel-context",
  OverlayUserContext = "overlay-user-context",
  OverlayVideoWidgetContextMenu = "overlay-video-widget-context-menu",
  OverlayVoiceWidgetContextMenu = "overlay-voice-widget-context-menu",
  Overlay = "overlay",
  PipMenu = "pip-menu",
  PlaintextPreviewOverflowMenu = "plaintext-preview-overflow-menu",
  PlaygroundSettingsMenu = "playground-settings-menu",
  PollMediaEditMenu = "poll-media-edit-menu",
  ProgressBarContext = "progress-bar-context",
  QuestsEntry = "quests-entry",
  RecentsNotifications = "recents-notifications",
  RecentsThreadNotifications = "recents-thread-notifications",
  ReportToModChannelContext = "report-to-mod-channel-context",
  RoleIconContext = "role-icon-context",
  /** Right-click "Server Subscriptions" */
  RoleSubscriptionContext = "role-subscription-context",
  RtcChannel = "rtc-channel",
  SearchResultSortMenu = "search-result-sort-menu",
  SearchResults = "search-results",
  SearchSettingsCog = "search-settings-cog",
  SendAnnouncementOptions = "send-announcement-options",
  SetImageForAction = "set-image-for-action",
  SetStatusSubmenuMobileWeb = "set-status-submenu-mobile-web",
  SetStatusSubmenu = "set-status-submenu",
  SettingsFooterMoreMenu = "settings-footer-more-menu",
  SortAndView = "sort-and-view",
  SoundButtonContext = "sound-button-context",
  StaffHelpPopout = "staff-help-popout",
  StaffOnlyEntryDebug = "staff-only-entry-debug",
  StreamContext = "stream-context",
  StreamOptions = "stream-options",
  SubscriptionContext = "subscription-context",
  SwitchAccountsSubmenu = "switch-accounts-submenu",
  TestSkus = "test-skus",
  TestStoreListing = "test-store-listing",
  TextContext = "text-context",
  TextareaContext = "textarea-context",
  /** Right-click a thread */
  ThreadContext = "thread-context",
  UnknownUserContext = "unknown-user-context",
  UserBotProfileAddApp = "user-bot-profile-add-app",
  UserBotProfileOverflowMenu = "user-bot-profile-overflow-menu",
  /** Right-click user */
  UserContext = "user-context",
  UserProfileFriendRequestButtons = "user-profile-friend-request-buttons",
  UserProfileOverflowMenu = "user-profile-overflow-menu",
  UserProfileWidgetContextMenu = "user-profile-widget-context-menu",
  UserSettingsChangeAvatar = "user-settings-change-avatar",
  /** Right-click settings */
  UserSettingsCog = "user-settings-cog",
  VideoBackgroundContext = "video-background-context",
  VideoDeviceContext = "video-device-context",
  WebauthnCredentialActions = "webauthn-credential-actions",
  WelcomeSettingsContext = "welcome-settings-context",
  WidgetGameTags = "widget-game-tags",
  WishlistOverflowMenu = "wishlist-overflow-menu",
}
