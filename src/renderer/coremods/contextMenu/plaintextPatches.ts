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
    find: ".Menu,{",
    replacements: [
      {
        match: /\.Menu,{/g,
        replace: (prefix) => `${prefix}data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
