/* eslint-disable @typescript-eslint/naming-convention */
import { filters, waitForModule } from "../webpack";

import type { RawModule } from "../../../types";
import type { Message, MessageAttachment } from "discord-types/general";

export enum ActivityActionTypes {
  JOIN = 1,
  LISTEN = 3,
  WATCH = 4,
  JOIN_REQUEST = 5,
}

export type Properties = Record<string, unknown>;

export interface CaptchaPayload {
  captcha_key: string;
  // cspell:ignore rqtoken
  captcha_rqtoken: string;
}

export interface MessageReference {
  guild_id?: string;
  channel_id: string;
  message_id: string;
}

export interface AllowedMentions {
  parse: Array<"users" | "roles" | "everyone">;
  replied_user: boolean;
}

export interface InviteSuggestion {
  isAffinitySuggestion: boolean;
  rowNum: number;
  numTotal: number;
  numAffinityConnections: number;
  isFiltered: boolean;
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
  context?: string;
  extraProperties?: Properties;
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
  activityAction?: ActivityActionTypes;
  location?: string;
  suggestedInvite?: InviteSuggestion;
  stickerIds?: string[];
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
  captchaPayload?: CaptchaPayload;
}

export interface TrackInviteOptions {
  inviteKey: string;
  channelId: string;
  messageId: string;
  location: string;
  suggested: InviteSuggestion;
  overrideProperties: Properties;
}

export interface Messages {
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
    attachments: MessageAttachment[],
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
      captchaPayload?: CaptchaPayload;
    },
  ) => void;
  sendInvite: (
    channelId: string,
    inviteCode: string,
    analyticsTriggeredFrom: string,
    suggestedInvite: InviteSuggestion,
  ) => void;
  sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    promise?: boolean,
    options?: OutgoingMessageOptions,
  ) => void;
  sendStickers: (channelId: string, stickerIds: string[]) => void;
  startEditMessage: (channelId: string, messageId: string, content: string) => void;
  suppressEmbeds: (channelId: string, messageId: string) => void;
  trackInvite: (options: TrackInviteOptions) => void;
  trackJump(
    channelId: string,
    messageId: string,
    context: string,
    extraProperties: Properties,
  ): void;
  truncateMessages: (channelId: string, truncateBottom: number, truncateTop: number) => void;
  updateEditMessage: (channelId: string, textValue: string, richValue: string) => void;
  _sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    options: OutgoingMessageOptions,
  ) => void;
  _tryFetchMessagesCached: (options: FetchMessageOptions) => void;
}

export default await waitForModule<RawModule & Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);
