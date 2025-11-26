import type { PlaintextPatch } from "src/types";

export default [
  {
    find: ".flagImage",
    replacements: [
      // ? Website is down for now, so disabling this patch
      /* {
        match: /\(0,\i\.jsx\).{0,100}options:\i,value:\i}\)/,
        replace: `[$exports?.Card() ?? null,$&]`,
      }, */
      {
        match: /children:\[(.+?\.localeName[^\]]*?)]/,
        replace: (_, ogChild) =>
          `children:$exports?.Percentage?$exports.Percentage(${ogChild}):[${ogChild}]`,
      },
    ],
  },
] as PlaintextPatch[];
