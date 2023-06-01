import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match: /(function [\w$]+\((\w)\){)(var \w,\w=.\.navId)/,
        replace: `$1replugged.coremods.coremods.contextMenu._insertMenuItems($2);$3`,
      },
    ],
  },
  {
    replacements: [
      {
        match: /(navId:[\w"-]+,)/g,
        replace: `$1data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
