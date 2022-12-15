/* eslint-disable @typescript-eslint/naming-convention */

import { ModuleExports } from "./discord";
import { Guild, Message } from "discord-types/general";

export interface MessageReference {
  guild_id?: string;
  channel_id: string;
  message_id: string;
}

export interface AllowedMentions {
  parse: Array<"users" | "roles" | "everyone">;
  replied_user: boolean;
}

export interface FetchMessageOptions {
  channelId: string;
  /** Snowflake */
  before?: string;
  /** Snowflake */
  after?: string;
  limit?: number;
  jump?: {
    highlight?: boolean;
    flash?: boolean;
    jumpType?: string;
    messageId?: string;
    offset?: number;
    returnMessageId?: boolean;
  };
  isPreload?: boolean;
  truncate?: boolean;
}

export interface SendMessageOptionsForReply {
  messageReference: MessageReference;
  allowed_mentions?: AllowedMentions;
}

export interface MessageJumpOptions {
  channelId: string;
  messageId: string;
  flash?: boolean;
  offset?: number;
  context?: unknown; // tbd
  extraProperties?: unknown; // tbd
  isPreload?: boolean;
  returnMessageId?: string;
  jumpType?: string;
}

export interface OutgoingMessage {
  content: string;
  invalidEmojis: string[];
  validNonShortcutEmojis: string[];
  tts: boolean;
}

export interface OutgoingMessageOptions {
  activityAction?: unknown; // tbd
  location?: string;
  suggestedInvite?: unknown; // tbd
  stickerIds?: string[];
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
  captchaPayload?: unknown; // tbd
}

export interface TrackInviteOptions {
  inviteKey: string;
  channelId: string;
  messageId: string;
  location: string;
  suggested: unknown; // tbd
  overrideProperties: unknown; // tbd
}

export type Messages = ModuleExports & {
  clearChannel: (channelId: string) => void;
  crosspostMessage: (channelId: string, messageId: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  dismissAutomatedMessage: (message: Message) => void;
  editMessage: (channelId: string, messageId: string, message: { content: string }) => void;
  endEditMessage: (channelId: string, messageId: string) => void;
  fetchMessages: (options: FetchMessageOptions) => void;
  focusMessage: (options: { channelId: string; messageId: string }) => void;
  getSendMessageOptionsForReply: (
    options: Message,
  ) => SendMessageOptionsForReply | Record<never, never>;
  jumpToMessage: (options: MessageJumpOptions) => void;
  jumpToPresent: (channelId: string, limit?: number) => void;
  patchMessageAttachments: (
    channelId: string,
    messageId: string,
    attachments: unknown[] /* tbd */,
  ) => void;
  receiveMessage: (channelId: string, message: Message) => void;
  revealMessage: (channelId: string, messageId: string) => void;
  sendBotMessage: (channelId: string, content: string, messageName?: string) => null;
  sendClydeError: (channelId: string, errorKey?: string) => void;
  sendGreetMessage: (
    channelId: string,
    stickerId: string,
    i: {
      messageReference: MessageReference;
      allowedMentions: AllowedMentions;
      captchaPayload?: unknown; // tbd
    },
  ) => void;
  sendInvite: (
    channelId: string,
    inviteCode: string,
    analyticsTriggeredFrom: string,
    r: unknown /* tbd */,
  ) => void;
  sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    unknownParam?: unknown /* tbd */,
    options?: OutgoingMessageOptions,
  ) => void;
  sendStickers: (channelId: string, stickerIds: string[]) => void;
  startEditMessage: (channelId: string, messageId: string, content: string) => void;
  suppressEmbeds: (channelId: string, messageId: string) => void;
  trackInvite: (options: TrackInviteOptions) => void;
  trackJump(
    channelId: string,
    messageId: string,
    context: unknown, // tbd
    unknownParam: unknown, // tbd
  ): void;
  truncateMessages: (channelId: string, truncateBottom: number, truncateTop: number) => void;
  updateEditMessage: (channelId: string, textValue: string, richValue: string) => void;
  _sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    options: OutgoingMessageOptions,
  ) => void;
  _tryFetchMessagesCached: (options: FetchMessageOptions) => void;
};

export type Typing = ModuleExports & {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
};

export type Channels = ModuleExports & {
  getChannelId: (unknownParam?: string) => string | undefined;
  getCurrentlySelectedChannelId: (unknownParam?: string) => string | undefined; // tbd
  getLastChannelFollowingDestination: () => unknown; // tbd
  getLastSelectedChannelId: (unknownParam: unknown) => string | undefined; // tbd
  getLastSelectedChannels: (unknownParam: unknown) => unknown; // tbd
  getMostRecentSelectedTextChannelId: (unknownParam: unknown) => string | undefined; // tbd
  getVoiceChannelId: (unknownParam?: string) => string | undefined; // tbd
};

export type Guilds = ModuleExports & {
  getGuild: (guildId: string) => Guild | undefined;
  getGuildCount: () => number;
  getGuildId: () => string | undefined;
  getGuilds: () => Record<string, Guild>;
  getLastSelectedGuildId: () => string | undefined;
  getLastSelectedTimeout: () => unknown; // tbd
  getState: () => unknown; // tbd
  getTabsV2SelectedGuildId: () => string | undefined;
};

export type Spotify = ModuleExports & {
  // todo: populate
};

export type SpotifySocket = ModuleExports & {
  // todo: populate
};

export type ContextMenu = ModuleExports & {
  // todo: populate
};

export type Modal = ModuleExports & {
  // todo: populate
};

export type Flux = ModuleExports & {
  // todo: populate
};

export type FluxDispatcher = ModuleExports & {
  // todo: populate
};

export type Router = ModuleExports & {
  // todo: populate
};

export type HighlightJS = ModuleExports & {
  // todo: populate
};

export type { CommonModules } from "../renderer/modules/webpack-common";
