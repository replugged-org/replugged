import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /var \w,\w=(.)\.navId/,
        replace: (vars, menu) =>
          `const patchedMenu=replugged.coremods.coremods.contextMenu._buildPatchedMenu(${menu});${vars}`,
      },
      {
        match: /(return)(\(0,.\.jsx.{50,72}\(\)\.menu)/,
        replace: (_, prefix, suffix) => `${prefix} patchedMenu?patchedMenu:${suffix}`,
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
