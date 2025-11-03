import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.language";

export default [
  {
    find: ".flagImage",
    replacements: [
      {
        match: /\(0,\i\.jsx\).{0,100}options:\i,value:\i}\)/,
        replace: `[${coremodStr}?.Card() ?? null,$&]`,
      },
      {
        match: /children:\[(.+?\.localeName[^\]]*?)]/,
        replace: (_, ogChild) =>
          `children:${coremodStr}?.Percentage?${coremodStr}.Percentage(${ogChild}):[${ogChild}]`,
      },
    ],
  },
] as PlaintextPatch[];
