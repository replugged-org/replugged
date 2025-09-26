import { WEBSITE_URL } from "src/constants";
import { init } from "src/renderer/apis/settings";
import type { BackgroundMaterialType, VibrancyType } from "src/types";

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
  transparency?: {
    enabled?: boolean;
    overrideWindowBackgroundColor?: boolean;
    windowBackgroundColor?: string;
    overrideWindowBackgroundMaterial?: boolean;
    windowBackgroundMaterial?: BackgroundMaterialType;
    overrideWindowVibrancy?: boolean;
    windowVibrancy?: VibrancyType;
  };
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
  transparency: {
    enabled: false,
    overrideWindowBackgroundColor: false,
    windowBackgroundColor: "#00000000",
    overrideWindowBackgroundMaterial: false,
    windowBackgroundMaterial: "none",
    overrideWindowVibrancy: false,
    windowVibrancy: "content",
  },
} satisfies Partial<GeneralSettings>;

export const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);
