import type { Channel, Guild } from "discord-types/general";
import type { ValueOf } from "type-fest";
import { CommandInteraction } from "../../renderer/apis/commands";
import type {
  APIEmbed,
  ApplicationCommandOptionType,
  CommandChoices,
  CommandOptionReturn,
  CommandOptions,
  StringOptions,
} from "../discord";

interface OptionTypeMapping {
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Integer]: number;
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.User]: string; // its user id
  [ApplicationCommandOptionType.Channel]: string; // its channel id
  [ApplicationCommandOptionType.Role]: string; // its role id
  [ApplicationCommandOptionType.Mentionable]: string; // id of whatever can be mentioned. usually channel/user/role
  [ApplicationCommandOptionType.Number]: number;
  [ApplicationCommandOptionType.Attachment]: { uploadedFilename: string; file: File };
}

type GetConditionallyOptional<T, Required extends boolean | undefined> = Required extends true
  ? T
  : T | undefined;

type GetType<T extends CommandOptions> = GetConditionallyOptional<
  T extends StringOptions
    ? T["choices"] extends readonly CommandChoices[]
      ? T["choices"][number]["value"]
      : OptionTypeMapping[T["type"]]
    : OptionTypeMapping[T["type"]],
  T["required"]
>;

export type GetCommandOption<T extends CommandOptionReturn, K extends T["name"]> = Extract<
  T,
  { name: K }
>;

export type GetCommandOptions<T extends CommandOptions> = ValueOf<{
  [K in T["name"]]: {
    focused?: boolean;
    name: K;
    type: T["type"];
    value: GetType<Extract<T, { name: K }>>;
  };
}>;

export type GetValueType<T extends CommandOptionReturn, D> = undefined extends T["value"]
  ? Exclude<T["value"], undefined> | D
  : T["value"];

export interface InexecutableReCelledCommand<T extends CommandOptions> {
  section?: ReCelledCommandSection;
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

export type ReCelledCommand<T extends CommandOptions> = InexecutableReCelledCommand<T> &
  (
    | {
        executor: (
          interaction: CommandInteraction<GetCommandOptions<T>>,
        ) => Promise<ReCelledCommandResult> | ReCelledCommandResult;
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

export type AnyReCelledCommand = ReCelledCommand<CommandOptions>;

export type ReCelledCommandResult = {
  send?: boolean;
  result?: string | null;
  embeds?: APIEmbed[];
} | null;

export interface ReCelledCommandSection {
  id: string;
  name: string;
  type?: 1;
  icon: string;
}
