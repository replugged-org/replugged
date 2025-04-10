import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

const replacements = [
  {
    match: /\(0,.{1,3}\.getPlatform\)\(\)/g,
    replace: `"WINDOWS"`,
  },
];

export default (navigator.userAgent.includes("Linux") && generalSettings.get("titleBar")
  ? [
      {
        find: ".appAsidePanelWrapper,",
        replacements,
      },
      {
        find: ".winButtons",
        replacements,
      },
      { find: "this.registerPopoutGlobalKeybinds", replacements },
      {
        find: "menubar:!1,toolbar:!1",
        replacements: [
          {
            match: "menubar:",
            replace: "frame:!1,menubar:",
          },
        ],
      },
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
