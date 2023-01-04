export interface CommandOptions {
  type: number;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  required?: boolean;
  choices?: Array<{
    name: string;
    values: string | number;
  }>;
  options?: CommandOptions[];
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: number[];
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
  autocomplete?: boolean;
}

export interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}
