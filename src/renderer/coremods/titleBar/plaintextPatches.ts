import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

const generalSettings = await init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

export default (DiscordNative.process.platform.includes("linux") && generalSettings.get("titleBar")
  ? [
      {
        find: ".appAsidePanelWrapper,",
        replacements: [
          {
            match: /\(0,.\.getPlatform\)\(\)/,
            replace: `"WINDOWS"`,
          },
        ],
      },
    ]
  : []) as PlaintextPatch[];
