import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /((\w+)\){)(var\s*\w+;let{navId:)/,
        replace: (_, prefix, menu, suffix) =>
<<<<<<< HEAD
          `${prefix}const patchedMenu=replugged.coremods.coremods.contextMenu._buildPatchedMenu(${menu});${suffix}`,
      },
      {
        match: /(patchedMenu.{2400,2600}return)(\(0,.\.jsx\)\(\w+.OnMenuSelectContext)/,
        replace: (_, prefix, suffix) => `${prefix} patchedMenu?patchedMenu:${suffix}`,
=======
          `${prefix}replugged.coremods.coremods.contextMenu._insertMenuItems(${menu});${suffix}`,
>>>>>>> e6dc5f6e17159dce8ffba344c35a8187a39edb4b
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
