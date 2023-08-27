import { CommandInteraction } from "../../renderer/apis/commands";
import {
  ApplicationCommandOptionType,
  CommandChoices,
  CommandOptionReturn,
  CommandOptions,
  StringOptions,
} from "../discord";
import { ObjectValues } from "../util";

export declare const CommandSymbol: unique symbol;

interface OptionTypeMapping {
  [ApplicationCommandOptionType.Subcommand]: string; // TODO: check
  [ApplicationCommandOptionType.SubcommandGroup]: string; // TODO: check
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Integer]: number;
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.User]: unknown; // TODO: better type
  [ApplicationCommandOptionType.Channel]: unknown; // TODO: better type
  [ApplicationCommandOptionType.Role]: unknown; // TODO: better type
  [ApplicationCommandOptionType.Mentionable]: unknown; // TODO: better type
  [ApplicationCommandOptionType.Number]: number;
  [ApplicationCommandOptionType.Attachment]: unknown; // TODO: better type
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
  T["type"] extends
    | ApplicationCommandOptionType.Subcommand
    | ApplicationCommandOptionType.SubcommandGroup
    ? true
    : T["required"]
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
    [CommandSymbol]: T;
  };
}>;

export type GetValueType<
  T extends CommandOptionReturn,
  D,
> = T[typeof CommandSymbol]["required"] extends true
  ? T["value"]
  : Exclude<T["value"], undefined> | D;

export interface InexecutableRepluggedCommand<T extends CommandOptions> {
  applicationId?: string;
  type?: number;
  id?: string;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  usage?: string;
  options?: T[];
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
        execute: (args: CommandOptionReturn[]) => Promise<void> | void;
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
