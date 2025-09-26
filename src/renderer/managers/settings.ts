import { WEBSITE_URL } from "src/constants";
import { init } from "src/renderer/apis/settings";

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
  transparentWindow?: boolean;
  overrideWindowBackgroundColor?: boolean;
  windowBackgroundColor?: string;
  overrideWindowBackgroundMaterial?: boolean;
  windowBackgroundMaterial?: string;
  overrideWindowVibrancy?: boolean;
  windowVibrancy?: string;
};

const defaultSettings = {
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
  transparentWindow: false,
  overrideWindowBackgroundColor: false,
  windowBackgroundColor: "#00000000",
  overrideWindowBackgroundMaterial: false,
  windowBackgroundMaterial: "none",
  overrideWindowVibrancy: false,
  windowVibrancy: "appearance-based",
} satisfies Partial<GeneralSettings>;

export const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);
