import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /var \w,\w=(.)\.navId/,
        replace: (vars, menu) =>
          `replugged.coremods.coremods.contextMenu._insertMenuItems(${menu});${vars}`,
      },
    ],
  },
  {
    find: "navId:",
    replacements: [
      {
        match: /navId:[\w"-]+,/g,
        replace: (navId) => `${navId}data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
