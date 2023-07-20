/* eslint-disable @typescript-eslint/naming-convention */
import { waitForProps } from "../webpack";

import type { Channel, Message, MessageAttachment } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

export enum ActivityActionTypes {
  JOIN = 1,
  LISTEN = 3,
  WATCH = 4,
  JOIN_REQUEST = 5,
}

type Properties = Record<string, unknown>;

interface MessageReference {
  guild_id?: string;
  channel_id?: string;
  message_id?: string;
}

interface AllowedMentions {
  parse?: Array<"users" | "roles" | "everyone">;
  replied_user?: boolean;
}

interface InviteSuggestion {
  isAffinitySuggestion: boolean;
  rowNum: number;
  numTotal: number;
  numAffinityConnections: number;
  isFiltered: boolean;
}

interface FetchMessagesOptions {
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
  focus?: { messageId: string };
  isPreload?: boolean;
  skipLocalFetch?: boolean;
  truncate?: boolean;
}

type FetchMessagesCachedOptions = Omit<FetchMessagesOptions, "isPreload" | "skipLocalFetch">;

interface FocusMessageOptions {
  channelId: string;
  messageId: string;
}

interface SendMessageForReplyOptions {
  channel: Channel;
  message: Message;
  shouldMention: boolean;
  showMentionToggle: boolean;
}

interface SendMessageOptionsForReply {
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
}

interface MessageJumpOptions {
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

interface Emoji {
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

interface OutgoingMessage {
  content: string;
  invalidEmojis?: Emoji[];
  validNonShortcutEmojis: Emoji[];
  tts?: boolean;
}

interface OutgoingMessageOptions {
  activityAction?: ActivityActionTypes;
  location?: string;
  suggestedInvite?: InviteSuggestion;
  stickerIds?: string[];
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
}

interface TrackInviteOptions {
  inviteKey: string;
  channelId: string;
  messageId: string;
  location: string;
  suggested?: InviteSuggestion;
  overrideProperties?: Properties;
}

interface MessageGreetOptions {
  messageReference?: MessageReference;
  allowedMentions?: AllowedMentions;
}

declare class LocalFetchComplete {
  public completed: boolean;

  public markComplete: () => void;
}

declare class MessageCache {
  public constructor(isCacheBefore: boolean);

  public _isCacheBefore: boolean;
  public _map: Record<string, Message>;
  public _messages: Message[];
  public _wasAtEdge: boolean;

  public get length(): number;
  public get wasAtEdge(): boolean;
  public set wasAtEdge(value: boolean);

  public cache: (messages: Message[], isAtEdge?: boolean) => void;
  public clear: () => void;
  public clone: () => MessageCache;
  public extract: (amount: number) => Message[];
  public extractAll: () => Message[];
  public forEach: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
  ) => void;
  public get: (messageId: string) => Message | undefined;
  public has: (messageId: string) => boolean;
  public remove: (messageId: string) => void;
  public removeMany: (messageIds: string[]) => void;
  public replace: (messageId: string, message: Message) => void;
  public update: (messageId: string, callback: (message: Message) => Message) => void;
}

interface MutatedChannelMessages {
  _after: MessageCache;
  _array: Message[];
  _before: MessageCache;
  _map: Record<string, Message>;
  cached?: boolean;
  error?: boolean;
  focusTargetId?: string | undefined;
  hasFetched?: boolean;
  hasMoreAfter?: boolean;
  hasMoreBefore?: boolean;
  jumped?: boolean;
  jumpedToPresent?: boolean;
  jumpFlash?: boolean;
  jumpReturnTargetId?: string | null;
  jumpSequenceId?: number;
  jumpTargetId?: string | null;
  jumpTargetOffset?: number;
  jumpType?: "ANIMATED" | "INSTANT";
  loadingMore?: boolean;
  ready?: boolean;
  revealedMessageId?: string | null;
}

export declare class ChannelMessages {
  public constructor(channelId: string);

  private static _channelMessages: Record<string, ChannelMessages>;

  public static clear: (channelId: string) => void;
  public static clearCache: (channelId: string) => void;
  public static commit: (channelMessages: ChannelMessages) => void;
  public static forEach: (
    callback: (
      messages: ChannelMessages,
      index: number,
      channelMessages: Record<string, ChannelMessages>,
    ) => void,
  ) => void;
  public static get: (channelId: string) => ChannelMessages;
  public static getOrCreate: (channelId: string) => ChannelMessages;
  public static hasPresent: (channelId: string) => boolean;

  private _after: MessageCache;
  private _array: Message[];
  private _before: MessageCache;
  private _map: Record<string, Message>;
  public cached: boolean;
  public channelId: string;
  public error: boolean;
  public focusTargetId?: string | undefined;
  public hasFetched: boolean;
  public hasMoreAfter: boolean;
  public hasMoreBefore: boolean;
  public jumped: boolean;
  public jumpedToPresent: boolean;
  public jumpFlash: boolean;
  public jumpReturnTargetId: string | null;
  public jumpSequenceId: number;
  public jumpTargetId: string | null;
  public jumpTargetOffset: number;
  public jumpType: "ANIMATED" | "INSTANT";
  public loadingMore: boolean;
  public ready: boolean;
  public revealedMessageId: string | null;

  public get length(): number;

  public _clearMessages: () => void;
  public _merge: (messages: Message[], prepend?: boolean, clearCache?: boolean) => void;
  public addCachedMessages: (messages: Message[], cache?: boolean) => ChannelMessages;
  public findNewest: (
    callback: (message: Message, index: number, messages: Message) => unknown,
  ) => Message | undefined;
  public findOldest: (
    callback: (message: Message, index: number, messages: Message) => unknown,
  ) => Message | undefined;
  public first: () => Message | undefined;
  public focusOnMessage: (focusTargetId: string) => ChannelMessages;
  public forAll: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
  ) => void;
  public forEach: (
    callback: (message: Message, index: number, messages: Message[]) => void,
    thisArg?: unknown,
    reverse?: boolean,
  ) => void;
  public get: (messageId: string, cache?: boolean) => Message | undefined;
  public getAfter: (messageId: string) => Message | null;
  public getByIndex: (index: number) => Message | undefined;
  public getManyAfter: (
    messageId: string,
    count: number,
    callback: (message: Message) => unknown,
  ) => Message[] | null;
  public getManyBefore: (
    messageId: string,
    count: number,
    callback: (message: Message) => unknown,
  ) => Message[] | null;
  public has: (messageId: string, cache?: boolean) => boolean;
  public hasAfterCached: (afterId: string) => boolean;
  public hasBeforeCached: (beforeId: string) => boolean;
  public hasPresent: () => boolean;
  public indexOf: (messageId: string) => number;
  public jumpToMessage: (
    jumpTargetId: string | null,
    jumpFlash: boolean,
    jumpTargetOffset: number,
    jumpReturnTargetId: string | null,
    jumpType?: "ANIMATED" | "INSTANT",
  ) => ChannelMessages;
  public jumpToPresent: (limit: number) => ChannelMessages;
  public last: () => Message | undefined;
  public loadComplete: (messages: ChannelMessages) => ChannelMessages;
  public loadFromCache: (before: boolean, limit: number) => ChannelMessages;
  public loadStart: (jumpData: {
    present: boolean;
    messageId: string | null;
    offset: number;
    returnMessageId: string;
  }) => ChannelMessages;
  public map: (
    callback: (message: Message, index: number, messages: Message[]) => Message,
    thisArg?: unknown,
  ) => Message[];
  public merge: (messages: Message[], prepend?: boolean, clearCache?: boolean) => ChannelMessages;
  public mergeDelta: (
    newMessages?: Message[],
    modifiedMessages?: Message[],
    deletedMessages?: Message[],
  ) => ChannelMessages;
  public mutate: (
    callback: ((messages: ChannelMessages) => void) | MutatedChannelMessages,
    deep?: boolean,
  ) => ChannelMessages;
  public receiveMessage: (message: Message, truncateFromTop?: boolean) => ChannelMessages;
  public receivePushNotification: (message: Message) => ChannelMessages;
  public reduce: (
    callback: (
      previousValue: unknown,
      currentMessage: Message,
      currentIndex: number,
      messages: Message[],
    ) => unknown,
    initialValue?: unknown,
  ) => void;
  public remove: (messageId: string) => ChannelMessages;
  public removeMany: (messageIds: string[]) => ChannelMessages;
  public replace: (prevMessageId: string, newMessage: Message) => ChannelMessages;
  public reset: (messages: Message[]) => ChannelMessages;
  public toArray: () => Message[];
  public truncate: (bottom?: boolean, top?: boolean) => ChannelMessages;
  public truncateBottom: (count: number, deep?: boolean) => ChannelMessages;
  public truncateTop: (count: number, deep?: boolean) => ChannelMessages;
  public update: (messageId: string, callback: (message: Message) => Message) => ChannelMessages;
}

export interface MessageStore {
  focusedMessageId: (channelId: string) => string | null | undefined;
  getLastCommandMessage: (channelId: string) => Message | undefined;
  getLastEditableMessage: (channelId: string) => Message | undefined;
  getMessage: (channelId: string, messageId: string) => Message | undefined;
  getMessages: (channelId: string) => ChannelMessages;
  hasCurrentUserSentMessage: (channelId: string) => boolean;
  hasPresent: (channelId: string) => boolean;
  isLoadingMessages: (channelId: string) => boolean;
  jumpedMessageId: (channelId: string) => string | null | undefined;
  whenReady: (channelId: string, callback: () => void) => void;
}

export type PartialMessageStore = Pick<MessageStore, "getMessage" | "getMessages">;

export interface MessageActions {
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
  endEditMessage: (channelId: string, response?: unknown) => void;
  fetchLocalMessages: (
    channelId: string,
    before: string,
    after: string,
    limit: number,
    localFetchComplete: LocalFetchComplete,
  ) => Promise<void>;
  fetchMessages: (options: FetchMessagesOptions) => Promise<boolean>;
  fetchNewLocalMessages: (channelId: string, limit: number) => Promise<void>;
  focusMessage: (options: FocusMessageOptions) => void;
  getSendMessageOptionsForReply: (
    options: SendMessageForReplyOptions,
  ) => SendMessageOptionsForReply | Record<never, never>;
  jumpToMessage: (options: MessageJumpOptions) => Promise<boolean>;
  jumpToPresent: (channelId: string, limit: number) => void;
  patchMessageAttachments: (
    channelId: string,
    messageId: string,
    attachments: MessageAttachment[],
  ) => Promise<void>;
  receiveMessage: (
    channelId: string,
    message: Message,
    optimistic?: boolean,
    options?: OutgoingMessageOptions,
  ) => void;
  revealMessage: (channelId: string, messageId: string) => void;
  sendActivityBookmark: (
    channelId: string,
    activityDetails: string,
    analyticsTriggeredFrom?: string,
    suggestedInvite?: InviteSuggestion,
  ) => Promise<unknown | void>;
  sendBotMessage: (channelId: string, content: string, messageName?: string) => void;
  sendClydeError: (channelId: string, code?: number) => void;
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
  ) => Promise<unknown | void>;
  startEditMessage: (channelId: string, messageId: string, content: string) => void;
  suppressEmbeds: (channelId: string, messageId: string) => Promise<void>;
  trackInvite: (options: TrackInviteOptions) => void;
  trackJump(
    channelId: string,
    messageId: string,
    context: string,
    extraProperties?: Properties,
  ): void;
  truncateMessages: (channelId: string, truncateBottom: boolean, truncateTop: boolean) => void;
  updateEditMessage: (channelId: string, textValue: string, richValue: unknown) => void;
  _sendMessage: (
    channelId: string,
    message: OutgoingMessage,
    options: OutgoingMessageOptions,
  ) => Promise<unknown | void>;
  _tryFetchMessagesCached: (options: FetchMessagesCachedOptions) => boolean;
}

export type Messages = PartialMessageStore & MessageActions;

const MessageStore = await waitForProps<MessageStore>("getMessage", "getMessages");

export default virtualMerge(
  await waitForProps<MessageActions>("sendMessage", "editMessage", "deleteMessage"),
  {
    getMessage: MessageStore.getMessage,
    getMessages: MessageStore.getMessages,
  },
);
