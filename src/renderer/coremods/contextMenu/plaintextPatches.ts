import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /var \w,\w=(.)\.navId/,
        replace: `replugged.coremods.coremods.contextMenu._insertMenuItems($1);$&`,
      },
    ],
  },
  {
    find: "navId:",
    replacements: [
      {
        match: /navId:[\w"-]+,/g,
        replace: `$&data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
