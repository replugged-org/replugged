import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /var \w,\w=(.)\.navId/,
        replace: (vars, menu) =>
          `if (!${menu}.plugged){` +
          `const patchedMenu=replugged.coremods.coremods.contextMenu._buildPatchedMenu(${menu});` +
          `if (patchedMenu!==null){return patchedMenu}` +
          `};${vars}`,
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
