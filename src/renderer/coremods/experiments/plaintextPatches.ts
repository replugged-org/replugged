import { init } from "src/renderer/apis/settings";
import type { PlaintextPatch } from "src/types";
import { type GeneralSettings, defaultSettings } from "src/types";

// TODO: see if we can import this from General.tsx
const generalSettings = await init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

export default [
  {
    find: /\.displayName="(Developer)?ExperimentStore"/,
    replacements: [
      // Why write an entire function for it? :trolley:
      // If `experiments` is true, the array element is present, otherwise it is
      // not.
      ...(generalSettings.get("experiments")
        ? [
            {
              match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
              replace: '"staging"',
            },
          ]
        : []),
    ],
  },
] as PlaintextPatch[];
