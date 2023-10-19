import { Message } from "@common/i18n";

export enum ApplicationCommandOptionType {
  //Subcommand = 1,
  //SubcommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
  Attachment = 11,
}

interface BaseCommandOptions<T extends ApplicationCommandOptionType> {
  type: T;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  serverLocalizedName?: string;
  required?: boolean;
}

export interface CommandChoices {
  name: string | Message;
  displayName: string | Message;
  value: string | number;
}

export interface CommandOptionAutocompleteAndChoices {
  autocomplete?: boolean;
  choices?: readonly CommandChoices[];
  focused?: boolean;
}

export interface StringOptions
  extends CommandOptionAutocompleteAndChoices,
    BaseCommandOptions<ApplicationCommandOptionType.String> {
  /* eslint-disable @typescript-eslint/naming-convention */
  min_length?: number;
  max_length?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface NumberOptions
  extends CommandOptionAutocompleteAndChoices,
    BaseCommandOptions<ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number> {
  /* eslint-disable @typescript-eslint/naming-convention */
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface ChannelOptions extends BaseCommandOptions<ApplicationCommandOptionType.Channel> {
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: readonly number[];
}

export interface OtherCommandOptions
  extends BaseCommandOptions<
    | ApplicationCommandOptionType.Attachment
    | ApplicationCommandOptionType.Boolean
    | ApplicationCommandOptionType.Mentionable
    | ApplicationCommandOptionType.Role
    | ApplicationCommandOptionType.User
  > {}

export interface CommandOptionReturn<T = unknown> {
  name: string;
  type: ApplicationCommandOptionType;
  value: T;
}

export type CommandOptions = StringOptions | NumberOptions | ChannelOptions | OtherCommandOptions;

export interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}

export enum MessageEmbedTypes {
  IMAGE = "image",
  VIDEO = "video",
  LINK = "link",
  ARTICLE = "article",
  TWEET = "tweet",
  RICH = "rich",
  GIFV = "gifv",
  APPLICATION_NEWS = "application_news",
  AUTO_MODERATION_MESSAGE = "auto_moderation_message",
  AUTO_MODERATION_NOTIFICATION = "auto_moderation_notification",
  TEXT = "text",
  POST_PREVIEW = "post_preview",
  GIFT = "gift",
  SAFETY_POLICY_NOTICE = "safety_policy_notice",
}

export interface APIEmbed {
  title?: string;
  type?: MessageEmbedTypes;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
  };
  video?: {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
}
