/* eslint-disable @typescript-eslint/naming-convention */
import { filters, waitForModule } from "../webpack";

import type { ObjectExports } from "../../../types";
import type { Channel, Message, MessageAttachment } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

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
  channel_id?: string;
  message_id?: string;
}

export interface AllowedMentions {
  parse?: Array<"users" | "roles" | "everyone">;
  replied_user?: boolean;
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

export interface SendMessageForReplyOptions {
  channel: Channel;
  message: Message;
  shouldMention: boolean;
  showMentionToggle: boolean;
}

export interface SendMessageOptionsForReply {
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
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
  skipLocalFetch?: boolean;
  jumpType?: string;
}

export interface Emoji {
  allNamesString: string;
  animated?: boolean;
  available?: boolean;
  guildId: string;
  id: string;
  managed?: boolean;
  name: string;
  require_colons?: boolean;
  roles?: string[];
  url: string;
}

export interface OutgoingMessage {
  content: string;
  invalidEmojis: Emoji[];
  validNonShortcutEmojis: Emoji[];
  tts?: boolean;
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
  suggested?: InviteSuggestion;
  overrideProperties?: Properties;
}

export interface MessageGreetOptions {
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
  captchaPayload?: CaptchaPayload;
}

export interface MessagesData {
  _after: MessageCache;
  _array: Message[];
  _before: MessageCache;
  _map: Record<string, Message>;
  cached: boolean;
  channelId: string;
  error: boolean;
  hasFetched: boolean;
  hasMoreAfter: boolean;
  hasMoreBefore: boolean;
  jumped: boolean;
  jumpedToPresent: boolean;
  jumpFlash: boolean;
  jumpReturnTargetId: string | null;
  jumpSequenceId: number;
  jumpTargetId: string | null;
  jumpTargetOffset: number;
  jumpType: "ANIMATED" | "INSTANT";
  length: number;
  loadingMore: boolean;
  ready: boolean;
  revealedMessageId: string | null;
  _clearMessages: () => void;
  _merge: (messages: Message[], cacheBefore?: boolean, clearCache?: boolean) => void;
  addCachedMessages: (messages: Message[], cache?: boolean) => MessagesData;
  findNewest: (
    callback: (message: Message, index: number, messages: Message) => unknown,
  ) => Message | undefined;
  findOldest: (
    callback: (message: Message, index: number, messages: Message) => unknown,
  ) => Message | undefined;
  first: () => Message | undefined;
  focusOnMessage: (focusTargetId: string) => MessagesData;
  forAll: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
  ) => void;
  forEach: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
    reverse?: boolean,
  ) => void;
  get: (messageId: string, cache?: boolean) => Message | undefined;
  getAfter: (messageId: string) => Message | null;
  getByIndex: (index: number) => Message | undefined;
  getManyAfter: (
    messageId: string,
    count: number,
    callback: (message: Message) => unknown,
  ) => Message[] | null;
  getManyBefore: (
    messageId: string,
    count: number,
    callback: (message: Message) => unknown,
  ) => Message[] | null;
  has: (messageId: string, cache?: boolean) => boolean;
  hasAfterCached: (messageId: string) => boolean;
  hasBeforeCached: (messageId: string) => boolean;
  hasPresent: () => boolean;
  indexOf: (messageId: string) => number;
  jumpToMessage: (
    jumpTargetId: string | null,
    jumpFlash: boolean,
    jumpTargetOffset: number,
    jumpReturnTargetId: string | null,
    jumpType?: "ANIMATED" | "INSTANT",
  ) => MessagesData;
  jumpToPresent: (count: number) => MessagesData;
  last: () => Message | undefined;
  loadComplete: (messageData: MessagesData) => MessagesData;
  loadFromCache: (beforeCache: boolean, extractCount: number) => MessagesData;
  loadStart: (jumpData: {
    present: boolean;
    messageId: string | null;
    offset: number;
    returnMessageId: string;
  }) => MessagesData;
  map: (
    callback: (message: Message, index: number, messages: Message[]) => unknown,
    thisArg?: unknown,
  ) => Message[];
  merge: (messages: Message[], cacheBefore?: boolean, clearCache?: boolean) => MessagesData;
  mutate: (
    data: ((messageData: MessagesData) => MessagesData) | MessagesData,
    clone?: boolean,
  ) => MessagesData;
  receiveMessage: (message: Message, truncate?: boolean) => MessagesData;
  receivePushNotification: (message: Message) => MessagesData;
  reduce: (
    callback: (
      previousValue: unknown,
      currentMessage: Message,
      currentIndex: number,
      messages: Message[],
    ) => unknown,
    initialValue?: unknown,
  ) => void;
  remove: (messageId: string) => MessagesData;
  removeMany: (messages: string[]) => MessagesData;
  replace: (messageId: string, message: Message) => MessagesData;
  reset: (messages: Message[]) => MessagesData;
  toArray: () => Message[];
  truncate: (bottom?: boolean, top?: boolean) => MessagesData;
  truncateBottom: (count: number, clone?: boolean) => MessagesData;
  truncateTop: (count: number, clone?: boolean) => MessagesData;
  update: (messageId: string, callback: (message: Message) => Message) => MessagesData;
}

export interface MessageCache {
  _isCacheBefore: boolean;
  _map: Record<string, Message>;
  _messages: Message[];
  _wasAtEdge: boolean;
  length: number;
  wasAtEdge: boolean;
  cache: (messages: Message[], wasAtEdge?: boolean) => void;
  clear: () => void;
  clone: () => MessageCache;
  extract: (count: number) => Message[];
  extractAll: () => Message[];
  forEach: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
  ) => void;
  get: (messageId: string) => Message | undefined;
  has: (messageId: string) => boolean;
  remove: (messageId: string) => void;
  removeMany: (messageIds: string[]) => void;
  replace: (messageId: string, message: Message) => void;
  update: (messageId: string, callback: (message: Message) => Message) => void;
}

export interface MessageStore {
  getMessage: (channelId: string, messageId: string) => Message | undefined;
  getMessages: (channelId: string) => MessagesData;
}

export interface Messages extends MessageStore {
  clearChannel: (channelId: string) => void;
  crosspostMessage: (channelId: string, messageId: string) => Promise<unknown | void>;
  deleteMessage: (
    channelId: string,
    messageId: string,
    keepThreadArchived?: boolean,
  ) => Promise<void>;
  dismissAutomatedMessage: (message: Message) => void;
  editMessage: (
    channelId: string,
    messageId: string,
    message: { content: string },
  ) => Promise<void>;
  endEditMessage: (channelId: string, response: unknown) => void;
  fetchLocalMessages: (
    channelId: string,
    before: string,
    after: string,
    limit: number,
    completeClass: unknown,
  ) => Promise<void>;
  fetchMessages: (options: FetchMessageOptions) => Promise<boolean>;
  focusMessage: (options: { channelId: string; messageId: string }) => void;
  getSendMessageOptionsForReply: (
    options: SendMessageForReplyOptions,
  ) => SendMessageOptionsForReply | Record<never, never>;
  jumpToMessage: (options: MessageJumpOptions) => void;
  jumpToPresent: (channelId: string, limit?: number) => void;
  patchMessageAttachments: (
    channelId: string,
    messageId: string,
    attachments: MessageAttachment[],
  ) => Promise<void>;
  receiveMessage: (
    channelId: string,
    message: Message,
    optimistic?: boolean,
    sendMessageOptions?: unknown,
  ) => void;
  revealMessage: (channelId: string, messageId: string) => void;
  sendBotMessage: (channelId: string, content: string, messageName?: string) => void;
  sendClydeError: (channelId: string, errorKey?: number) => void;
  sendGreetMessage: (
    channelId: string,
    stickerId: string,
    options?: MessageGreetOptions,
  ) => Promise<unknown | void>;
  sendInvite: (
    channelId: string,
    inviteCode: string,
    analyticsTriggeredFrom?: string,
    suggestedInvite?: InviteSuggestion,
  ) => Promise<unknown | void>;
  sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    promise?: boolean,
    options?: OutgoingMessageOptions,
  ) => Promise<unknown | void>;
  sendStickers: (
    channelId: string,
    stickerIds: string[],
    content?: string,
    options?: SendMessageOptionsForReply | Record<never, never>,
    tts?: boolean,
  ) => void;
  startEditMessage: (channelId: string, messageId: string, content: string) => void;
  suppressEmbeds: (channelId: string, messageId: string) => Promise<void>;
  trackInvite: (options: TrackInviteOptions) => void;
  trackJump(
    channelId: string,
    messageId: string,
    context: string,
    extraProperties?: Properties,
  ): void;
  truncateMessages: (channelId: string, truncateBottom: number, truncateTop: number) => void;
  updateEditMessage: (channelId: string, textValue: string, richValue: unknown) => void;
  _sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    options: OutgoingMessageOptions,
  ) => void;
  _tryFetchMessagesCached: (options: FetchMessageOptions) => void;
}

const MessageStore = await waitForModule<ObjectExports & MessageStore>(
  filters.byProps("getMessage", "getMessages"),
);

export default virtualMerge(
  await waitForModule<ObjectExports & Messages>(
    filters.byProps("sendMessage", "editMessage", "deleteMessage"),
  ),
  {
    getMessage: MessageStore.getMessage,
    getMessages: MessageStore.getMessages,
  },
);
