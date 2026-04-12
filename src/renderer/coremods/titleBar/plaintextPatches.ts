import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

export default [
  ...(generalSettings.get("titleBar")
    ? [
        // Patch the title bar to hide the buttons
        {
          find: /trailing:\i,windowKey:\i/,
          replacements: [
            {
              match: /\(0,\i\.getPlatform\)\(\)/g,
              replace: `"WEB"`,
            },
          ],
        },
        // Hide the title bar in popout windows
        {
          find: "Missing guestWindow reference",
          replacements: [
            {
              match: /(\i\({withTitleBar:)\i/,
              replace: "$1!1",
            },
          ],
        },
        // Change the platform class name to 'platform-web' to not apply title bar styles
        {
          find: "platform-web",
          replacements: [
            {
              match: /(platform-overlay`:)\i/,
              replace: '$1"platform-web"',
            },
          ],
        },
      ]
    : []),
  // Toggle the 'frame' option for popout windows
  // ? This also fixes an issue on Linux where the title bar would always be visible in popout windows
  {
    find: "menubar:!1,toolbar:!1",
    replacements: [
      {
        match: "menubar:",
        replace: `frame:${generalSettings.get("titleBar")},$&`,
      },
    ],
  },
] as PlaintextPatch[];
