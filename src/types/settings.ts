import { WEBSITE_URL } from "src/constants";
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
  overrideWindowBackgroundColor?: boolean;
  windowBackgroundColor?: string;
  overrideWindowBackgroundMaterial?: boolean;
  windowBackgroundMaterial?: string;
  overrideWindowVibrancy?: boolean;
  windowVibrancy?: string;
};

export const defaultSettings = {
  apiUrl: WEBSITE_URL,
  experiments: false,
  badges: true,
  autoApplyQuickCss: false,
  showWelcomeNoticeOnOpen: true,
  transparentWindow: false,
  reactDevTools: false,
  addonEmbeds: true,
  overrideWindowBackgroundColor: false,
  windowBackgroundColor: "#00000000",
  overrideWindowBackgroundMaterial: false,
  windowBackgroundMaterial: "none",
  overrideWindowVibrancy: false,
  windowVibrancy: "appearance-based",
} satisfies Partial<GeneralSettings>;
