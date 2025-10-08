import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

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
