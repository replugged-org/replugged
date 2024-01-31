import type { Promisable } from "type-fest";

export type SettingsMap = Map<string, unknown>;
export type TransactionHandler<T> = () => Promisable<T>;
export type SettingsTransactionHandler<T> = (settings: SettingsMap) => Promisable<T>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GeneralSettings = {
  apiUrl?: string;
  experiments?: boolean;
  badges?: boolean;
  autoApplyQuickCss?: boolean;
  showWelcomeNoticeOnOpen?: boolean;
  addonEmbeds?: boolean;
  reactDevTools?: boolean;
  transparentWindow?: boolean;
};

export const defaultSettings = {
  apiUrl: "https://replugged.dev",
  experiments: false,
  badges: true,
  autoApplyQuickCss: false,
  showWelcomeNoticeOnOpen: true,
  transparentWindow: false,
  reactDevTools: false,
  addonEmbeds: true,
} satisfies Partial<GeneralSettings>;
