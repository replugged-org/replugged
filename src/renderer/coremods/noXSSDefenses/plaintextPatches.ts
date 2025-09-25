import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Messages.SELF_XSS_HEADER",
    replacements: [
      ...(generalSettings.get("keepToken")
        ? [
            {
              match: /if\(null!=\i&&"0\.0\.0"/,
              replace: "return;$&",
            },
          ]
        : []),
      {
        match: /null!=\i\.\i\.Messages\.SELF_XSS_HEADER/,
        replace: "false",
      },
    ],
  },
] as PlaintextPatch[];
