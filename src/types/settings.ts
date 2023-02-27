import type { Promisable } from "type-fest";

export type SettingsMap = Map<string, unknown>;
export type TransactionHandler<T> = () => Promisable<T>;
export type SettingsTransactionHandler<T> = (settings: SettingsMap) => Promisable<T>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GeneralSettings = {
  apiUrl: string;
  // pluginEmbeds: boolean;
  experiments: boolean;
};

export const defaultSettings: Partial<GeneralSettings> = {
  apiUrl: "https://replugged.dev",
  // pluginEmbeds: false,
  experiments: false,
};
