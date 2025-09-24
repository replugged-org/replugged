import { WEBSITE_URL } from "src/constants";

export type SettingsMap = Map<string, unknown>;
export type TransactionHandler<T> = () => T;
export type SettingsTransactionHandler<T> = (settings: SettingsMap) => T;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GeneralSettings = {
  apiUrl?: string;
  experiments?: boolean;
  staffDevTools?: boolean;
  badges?: boolean;
  autoApplyQuickCss?: boolean;
  showWelcomeNoticeOnOpen?: boolean;
  addonEmbeds?: boolean;
  reactDevTools?: boolean;
  titleBar?: boolean;
  quickCSS?: boolean;
  keepToken?: boolean;
};

export const defaultSettings = {
  apiUrl: WEBSITE_URL,
  experiments: false,
  staffDevTools: false,
  badges: true,
  autoApplyQuickCss: false,
  showWelcomeNoticeOnOpen: true,
  reactDevTools: false,
  addonEmbeds: true,
  titleBar: false,
  quickCSS: true,
  keepToken: false,
} satisfies Partial<GeneralSettings>;
