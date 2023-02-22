import type { PlaintextPatch } from "src/types";

export default [
  {
    find: /\.displayName="(Developer)?ExperimentStore"/,
    replacements: [
      // Why write an entire function for it? :trolley:
      // If `experiments` is true, the array element is present, otherwise it is
      // not.
      {
        match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
        replace:
          'replugged.coremods.coremods.settings.getExperimentsEnabled() ? "staging" : window.GLOBAL_ENV.RELEASE_CHANNEL',
      },
    ],
  },
] as PlaintextPatch[];
