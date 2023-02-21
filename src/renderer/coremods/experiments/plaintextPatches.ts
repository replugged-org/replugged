import { settings } from "@replugged";
import type { PlaintextPatch } from "src/types";
import { GeneralSettings } from "../settings/pages";

const generalSettings = await settings.init<GeneralSettings>("rp-settings");

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
