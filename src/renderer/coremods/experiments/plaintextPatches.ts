import type { PlaintextPatch } from "src/types";

export default [
  {
    find: /\.displayName="(Developer)?ExperimentStore"/,
    replacements: [
      {
        match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
        replace: '"staging"',
      },
    ],
  },
] as PlaintextPatch[];
