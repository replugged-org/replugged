import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /((\w+)\){)(var\s*\w+;let{navId:)/,
        replace: (_, prefix, menu, suffix) =>
          `${prefix}const patchedMenu=replugged.coremods.coremods.contextMenu._buildPatchedMenu(${menu});${suffix}`,
      },
      {
        match: /(patchedMenu.{2400,2600}return)(\(0,.\.jsx\)\(\w+.OnMenuSelectContext)/,
        replace: (_, prefix, suffix) => `${prefix} patchedMenu??${suffix}`,
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
