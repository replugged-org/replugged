import { Channel, Guild } from "discord-types/general";
import { CommandInteraction } from "../../renderer/apis/commands";
import {
  ApplicationCommandOptionType,
  CommandChoices,
  CommandOptionReturn,
  CommandOptions,
  StringOptions,
} from "../discord";
import { ObjectValues } from "../util";

interface OptionTypeMapping {
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Integer]: number;
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.User]: string; // its user id
  [ApplicationCommandOptionType.Channel]: string; // its channel id
  [ApplicationCommandOptionType.Role]: string; // its role id
  [ApplicationCommandOptionType.Mentionable]: string; // id of whatever can be mentioned. usually channel/user/role
  [ApplicationCommandOptionType.Number]: number;
  //[ApplicationCommandOptionType.Attachment]: unknown; // TODO: better type
}

type GetConditionallyOptional<T, Required extends boolean | undefined> = Required extends true
  ? T
  : T | undefined;

type GetType<T extends CommandOptions> = GetConditionallyOptional<
  T extends StringOptions
    ? T["choices"] extends CommandChoices
      ? T["choices"][number]["value"]
      : OptionTypeMapping[T["type"]]
    : OptionTypeMapping[T["type"]],
  T["required"]
>;

export type GetCommandOption<T extends CommandOptionReturn, K extends T["name"]> = Extract<
  T,
  { name: K }
>;

export type GetCommandOptions<T extends CommandOptions> = ObjectValues<{
  [K in T["name"]]: {
    focused: unknown;
    name: K;
    type: T["type"];
    value: GetType<Extract<T, { name: K }>>;
  };
}>;

export type GetValueType<T extends CommandOptionReturn, D> = undefined extends T["value"]
  ? Exclude<T["value"], undefined> | D
  : T["value"];

export interface InexecutableRepluggedCommand<T extends CommandOptions> {
  applicationId?: string;
  type?: number;
  id?: string;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  usage?: string;
  options?: readonly T[];
}

export type RepluggedCommand<T extends CommandOptions> = InexecutableRepluggedCommand<T> &
  (
    | {
        executor: (
          interaction: CommandInteraction<GetCommandOptions<T>>,
        ) => Promise<RepluggedCommandResult> | RepluggedCommandResult;
        execute?: never;
      }
    | {
        execute: (
          args: Array<GetCommandOptions<T>>,
          currentInfo: { channel: Channel; guild: Guild },
        ) => Promise<void> | void;
        executor?: never;
      }
  );

export type AnyRepluggedCommand = RepluggedCommand<CommandOptions>;

export interface RepluggedCommandEmbed {
  type: "rich" | "image" | "video" | "article";
  title: string;
  description: string;
  color?: string | number;
  thumbnail?: {
    url: string;
    proxyURL: string;
    width: number;
    height: number;
  };
  image?: {
    url: string;
    proxyURL: string;
    width: number;
    height: number;
  };
  video?: {
    url: string;
    proxyURL: string;
    width: number;
    height: number;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
  author?: {
    iconProxyURL: string;
    iconURL: string;
    name: string;
    url?: string;
  };
  footer?: {
    text: string;
    iconProxyURL: string;
    iconURL: string;
  };
  provider?: { name: string; url: string };
  timestamp?: string;
}
export interface RepluggedCommandResult {
  send: boolean;
  result?: string;
  embeds?: RepluggedCommandEmbed[];
}
export interface RepluggedCommandSection {
  id: string;
  name: string;
  type?: 1;
  icon: string;
}
