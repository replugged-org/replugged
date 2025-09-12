import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

// TODO: see if we can import this from General.tsx
const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

export default (navigator.userAgent.includes("Linux") && generalSettings.get("titleBar")
  ? [
      // Patch the title bar to show the buttons
      {
        find: ".winButtons,",
        replacements: [
          {
            match: /\(0,.{1,3}\.getPlatform\)\(\)/g,
            replace: `"WINDOWS"`,
          },
        ],
      },
      // Disable the 'frame' option for popout windows
      {
        find: "menubar:!1,toolbar:!1",
        replacements: [
          {
            match: "menubar:",
            replace: "frame:!1,menubar:",
          },
        ],
      },
      // Add the 'platform-win' class name to get styles for the custom title bar
      {
        find: "platform-linux",
        replacements: [
          {
            match: "platform-linux",
            replace: "platform-linux platform-win",
          },
        ],
      },
    ]
  : []) as PlaintextPatch[];
