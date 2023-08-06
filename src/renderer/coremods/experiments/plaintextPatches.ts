import type { PlaintextPatch } from "src/types";

const isEnabledFn = "replugged.coremods.coremods.experiments?.getEnabled()";

export default [
  {
    find: /\.displayName="(Developer)?ExperimentStore"/,
    replacements: [
      {
        match: /(isDeveloper:{configurable:!1,get:function\(\){return )\w+(}})/g,
        replace: (_, before, after) => `${before}${isEnabledFn}${after}`,
      },
    ],
  },
] as PlaintextPatch[];
