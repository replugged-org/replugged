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
      // Pre Discord Refresh
      {
        find: ".appAsidePanelWrapper,",
        replacements,
      },
      // Discord Refresh
      {
        find: ".winButtons",
        replacements,
      },
      // Popouts
      { find: "this.registerPopoutGlobalKeybinds", replacements },
      // Disabling Native Titlebar in popouts
      {
        find: "menubar:!1,toolbar:!1",
        replacements: [
          {
            match: "menubar:",
            replace: "frame:!1,menubar:",
          },
        ],
      },
    ]
  : []) as PlaintextPatch[];
