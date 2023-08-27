export enum ApplicationCommandOptionType {
  String = 3,
  Integer,
  Boolean,
  User,
  Channel,
  Role,
  Mentionable,
  Number,
  Attachment,
}

export type CommandChoices = ReadonlyArray<{
  name: string;
  displayName: string;
  value: string;
}>;

interface BaseCommandOptions {
  type: ApplicationCommandOptionType;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  serverLocalizedName?: string;
  required?: boolean;
}

export interface StringOptions extends BaseCommandOptions {
  type: ApplicationCommandOptionType.String;
  choices?: CommandChoices;
  autocomplete?: boolean;
}

export interface NumberOptions extends BaseCommandOptions {
  type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
  /* eslint-disable @typescript-eslint/naming-convention */
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface UserOptions extends BaseCommandOptions {
  type: ApplicationCommandOptionType.User;
}

export interface ChannelOptions extends BaseCommandOptions {
  type: ApplicationCommandOptionType.Channel;
  required?: boolean;
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: readonly number[];
}

export interface OtherCommandOptions extends BaseCommandOptions {
  type:
    | ApplicationCommandOptionType.Boolean
    | ApplicationCommandOptionType.Role
    | ApplicationCommandOptionType.Mentionable
    | ApplicationCommandOptionType.Attachment;
}

export interface CommandOptionReturn<T = unknown> {
  focused: unknown; // literally no clue what it is for...
  name: string;
  type: ApplicationCommandOptionType;
  value: T;
}

export type CommandOptions =
  | StringOptions
  | NumberOptions
  | UserOptions
  | ChannelOptions
  | OtherCommandOptions;

export interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}
