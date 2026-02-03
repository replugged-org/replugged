import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

export default (generalSettings.get("titleBar")
  ? [
      // Patch the title bar to hide the buttons
      {
        find: /{leading:\i,title:\i/,
        replacements: [
          {
            match: /\(0,.{1,3}\.getPlatform\)\(\)/g,
            replace: `"WEB"`,
          },
        ],
      },
      // Enable the 'frame' option for popout windows
      {
        find: "menubar:!1,toolbar:!1",
        replacements: [
          {
            match: "menubar:",
            replace: "frame:!0,$&",
          },
        ],
      },
      // Change the platform class name to 'platform-web' to not apply title bar styles
      {
        find: "platform-web",
        replacements: [
          {
            match: /(platform-overlay"\):)\i/,
            replace: '$1"platform-web"',
          },
        ],
      },
    ]
  : []) as PlaintextPatch[];
