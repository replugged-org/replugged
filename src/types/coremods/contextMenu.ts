import type { ContextMenuType } from "../../renderer/modules/components/ContextMenu";
import { ReactComponent } from "../util";

export interface RawContextItem {
  type: ReactComponent<unknown>;
  children?: Array<RawContextItem | ContextItem | undefined>;
  action?(): unknown;

  [key: string]: unknown;
}

export type ContextItem =
  | ContextMenuType["MenuItem"]
  | ContextMenuType["MenuGroup"]
  | ContextMenuType["MenuCheckboxItem"]
  | ContextMenuType["MenuControlItem"]
  | ContextMenuType["MenuRadioItem"]
  | ContextMenuType["MenuSeparator"];

export type GetContextItem = (
  data: Record<string, unknown>,
  menu: ContextMenuType["ContextMenu"],
) => RawContextItem | ContextItem | undefined;

/**
 * An enum for the navIds of context menus across discord
 * @enum {string}
 */
export enum ContextMenuTypes {
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
