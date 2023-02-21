import type { PlaintextPatch } from "src/types";
import { GeneralSettings } from "../settings/pages";
import { init as initSettings } from "../../apis/settings";

const generalSettings = await initSettings<GeneralSettings>("rp-settings");

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
