export enum ApplicationCommandOptionType {
	Subcommand = 1,
	SubcommandGroup,
	String,
	Integer,
	Boolean,
	User,
	Channel,
	Role,
	Mentionable,
	Number,
	Attachment,
}

export interface CommandOptions {
  type: ApplicationCommandOptionType;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  required?: boolean;
  choices?: Array<{
    name: string;
    displayName: string;
    value: string | number;
  }>;
  options?: CommandOptions[];
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: number[];
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
  autocomplete?: boolean;
}

export interface CommandOptionReturn {
  focused: unknown; // literally no clue what it is for...
  name: string;
  type: ApplicationCommandOptionType;
  value: string;
}

export interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}
