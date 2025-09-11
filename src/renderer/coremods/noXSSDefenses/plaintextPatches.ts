import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

// TODO: see if we can import this from General.tsx
const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

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
